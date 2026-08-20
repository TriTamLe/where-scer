import { v } from 'convex/values'

import { SPECIAL_ACCOUNT_CODE } from './accounts'
import { mutation, query } from './_generated/server'

const locationType = v.union(
  v.literal('country'),
  v.literal('province'),
  v.literal('ward')
)

async function accountForCode(
  ctx: Parameters<typeof query>[0] extends never ? never : any,
  code: string
) {
  return ctx.db
    .query('accounts')
    .withIndex('by_code', (index: any) =>
      index.eq('code', code.trim().toUpperCase())
    )
    .unique()
}

export const toggle = mutation({
  args: {
    code: v.string(),
    locationCode: v.string(),
    selected: v.boolean(),
    type: locationType
  },
  handler: async (ctx, { code, locationCode, selected, type }) => {
    const account = await accountForCode(ctx, code)
    if (!account) throw new Error('Không tìm thấy account này.')

    const apply = async (
      nextType: 'country' | 'province' | 'ward',
      nextCode: string
    ) => {
      const accountCheckins = await ctx.db
        .query('checkins')
        .withIndex('by_account_type')
        .collect()
      const existing = accountCheckins.find(
        (checkin) =>
          checkin.accountId === account._id &&
          checkin.type === nextType &&
          checkin.locationCode === nextCode
      )
      if (selected && !existing) {
        await ctx.db.insert('checkins', {
          accountId: account._id,
          createdAt: Date.now(),
          locationCode: nextCode,
          type: nextType
        })
      }
      if (!selected && existing) await ctx.db.delete(existing._id)
    }

    await apply(type, locationCode)
    if (selected && (type === 'province' || type === 'ward')) {
      await apply('country', '704')
    }
  }
})

export const dashboard = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const account = await accountForCode(ctx, code)
    if (!account) return null

    const checkins = await ctx.db.query('checkins').collect()
    const accounts = new Map<string, string>()
    for (const checkin of checkins) {
      if (!accounts.has(String(checkin.accountId))) {
        const member = await ctx.db.get(checkin.accountId)
        if (member) accounts.set(String(member._id), member.nickname)
      }
    }

    const groups = {
      country: [] as Array<{
        code: string
        count: number
        nicknames: string[]
      }>,
      province: [] as Array<{
        code: string
        count: number
        nicknames: string[]
      }>,
      ward: [] as Array<{ code: string; count: number; nicknames: string[] }>
    }
    for (const type of ['country', 'province', 'ward'] as const) {
      const grouped = new Map<string, string[]>()
      for (const checkin of checkins) {
        if (checkin.type !== type) continue
        const nickname = accounts.get(String(checkin.accountId))
        if (!nickname) continue
        grouped.set(checkin.locationCode, [
          ...(grouped.get(checkin.locationCode) ?? []),
          nickname
        ])
      }
      groups[type] = [...grouped.entries()].map(
        ([locationCode, nicknames]) => ({
          code: locationCode,
          count: nicknames.length,
          nicknames: nicknames.sort((left, right) =>
            left.localeCompare(right, 'vi')
          )
        })
      )
    }

    return {
      account: { code: account.code, nickname: account.nickname },
      groups,
      memberCount: accounts.size,
      selected: checkins
        .filter((checkin) => checkin.accountId === account._id)
        .map((checkin) => ({ code: checkin.locationCode, type: checkin.type })),
      checkedInCountryCount: groups.country.length,
      canExport: account.code === SPECIAL_ACCOUNT_CODE
    }
  }
})

export const exportCounts = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const account = await accountForCode(ctx, code)
    if (account?.code !== SPECIAL_ACCOUNT_CODE) {
      throw new Error('Account này không có quyền xuất dữ liệu.')
    }
    const checkins = await ctx.db.query('checkins').collect()
    const result = {
      country: new Map<string, number>(),
      province: new Map<string, number>(),
      ward: new Map<string, number>()
    }
    for (const checkin of checkins) {
      const type = checkin.type
      result[type].set(
        checkin.locationCode,
        (result[type].get(checkin.locationCode) ?? 0) + 1
      )
    }
    return {
      country: [...result.country.entries()].map(([locationCode, count]) => ({
        code: locationCode,
        count
      })),
      province: [...result.province.entries()].map(([locationCode, count]) => ({
        code: locationCode,
        count
      })),
      ward: [...result.ward.entries()].map(([locationCode, count]) => ({
        code: locationCode,
        count
      }))
    }
  }
})
