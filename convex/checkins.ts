import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

import { SPECIAL_ACCOUNT_CODE } from './accounts'
import { mutation, query } from './_generated/server'

const locationType = v.union(
  v.literal('country'),
  v.literal('province'),
  v.literal('ward')
)

async function accountForCode(ctx: any, code: string) {
  return ctx.db
    .query('accounts')
    .withIndex('by_code', (index: any) =>
      index.eq('code', code.trim().toUpperCase())
    )
    .unique()
}

async function updateLocationStat(
  ctx: any,
  type: 'country' | 'province' | 'ward',
  locationCode: string,
  change: 1 | -1
) {
  const stat = await ctx.db
    .query('locationStats')
    .withIndex('by_type_location', (index: any) =>
      index.eq('type', type).eq('locationCode', locationCode)
    )
    .unique()

  if (!stat) {
    if (change < 0) return
    await ctx.db.insert('locationStats', {
      count: 1,
      locationCode,
      type,
      updatedAt: Date.now()
    })
    return
  }

  await ctx.db.patch(stat._id, {
    count: Math.max(0, stat.count + change),
    updatedAt: Date.now()
  })
}

export const mine = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const account = await accountForCode(ctx, code)
    if (!account) return null

    const checkins = await ctx.db
      .query('checkins')
      .withIndex('by_account_type', (index) =>
        index.eq('accountId', account._id)
      )
      .collect()

    return {
      account: {
        code: account.code,
        nickname: account.nickname,
        publicId: account.publicId ?? ''
      },
      canExport: account.code === SPECIAL_ACCOUNT_CODE,
      selected: checkins.map((checkin) => ({
        code: checkin.locationCode,
        type: checkin.type
      }))
    }
  }
})

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
      const existing = await ctx.db
        .query('checkins')
        .withIndex('by_account_type_code', (index) =>
          index
            .eq('accountId', account._id)
            .eq('type', nextType)
            .eq('locationCode', nextCode)
        )
        .unique()
      if (selected && !existing) {
        await ctx.db.insert('checkins', {
          accountId: account._id,
          createdAt: Date.now(),
          locationCode: nextCode,
          type: nextType
        })
        await updateLocationStat(ctx, nextType, nextCode, 1)
      }
      if (!selected && existing) {
        await ctx.db.delete(existing._id)
        await updateLocationStat(ctx, nextType, nextCode, -1)
      }
    }

    await apply(type, locationCode)
    if (selected && (type === 'province' || type === 'ward')) {
      await apply('country', '704')
    }
    await ctx.db.patch(account._id, { updatedAt: Date.now() })
  }
})

export const mapStats = query({
  args: { type: locationType },
  handler: async (ctx, { type }) => {
    const stats = await ctx.db
      .query('locationStats')
      .withIndex('by_type', (index) => index.eq('type', type))
      .collect()

    return stats.map((stat) => ({
      code: stat.locationCode,
      count: stat.count
    }))
  }
})

export const locationPeople = query({
  args: { code: v.string(), locationCode: v.string(), type: locationType },
  handler: async (ctx, { code, locationCode, type }) => {
    const account = await accountForCode(ctx, code)
    const checkins = await ctx.db
      .query('checkins')
      .withIndex('by_type_location_account', (index) =>
        index.eq('type', type).eq('locationCode', locationCode)
      )
      .take(3)
    const people: string[] = []

    for (const checkin of checkins) {
      if (checkin.accountId === account?._id) continue
      const person = await ctx.db.get(checkin.accountId)
      if (person?.nickname) people.push(person.nickname)
      if (people.length === 2) break
    }

    return people
  }
})

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const [checkins, countryStats] = await Promise.all([
      ctx.db.query('checkins').collect(),
      ctx.db
        .query('locationStats')
        .withIndex('by_type', (index) => index.eq('type', 'country'))
        .collect()
    ])

    return {
      checkedInCountryCount: countryStats.filter((stat) => stat.count > 0)
        .length,
      checkedInMemberCount: new Set(
        checkins.map((checkin) => checkin.accountId)
      ).size
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
    const stats = await ctx.db.query('locationStats').collect()
    return {
      country: stats
        .filter((stat) => stat.type === 'country')
        .map((stat) => ({ code: stat.locationCode, count: stat.count })),
      province: stats
        .filter((stat) => stat.type === 'province')
        .map((stat) => ({ code: stat.locationCode, count: stat.count })),
      ward: stats
        .filter((stat) => stat.type === 'ward')
        .map((stat) => ({ code: stat.locationCode, count: stat.count }))
    }
  }
})

export const rebuildLocationStats = mutation({
  args: {},
  handler: async (ctx) => {
    const checkins = await ctx.db.query('checkins').collect()
    const existingStats = await ctx.db.query('locationStats').collect()
    const counts = new Map<string, number>()

    for (const checkin of checkins) {
      const key = `${checkin.type}:${checkin.locationCode}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    for (const stat of existingStats) await ctx.db.delete(stat._id)
    for (const [key, count] of counts) {
      const [type, locationCode] = key.split(':') as [
        'country' | 'province' | 'ward',
        string
      ]
      await ctx.db.insert('locationStats', {
        count,
        locationCode,
        type,
        updatedAt: Date.now()
      })
    }
    return { locations: counts.size }
  }
})

export const peopleByCountry = query({
  args: { countryCode: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { countryCode, paginationOpts }) => {
    const page = await ctx.db
      .query('checkins')
      .withIndex('by_type_location_account', (index) =>
        index.eq('type', 'country').eq('locationCode', countryCode)
      )
      .paginate(paginationOpts)
    const people = await Promise.all(
      page.page.map(async (checkin) => {
        const account = await ctx.db.get(checkin.accountId)
        return account?.publicId
          ? { nickname: account.nickname, publicId: account.publicId }
          : null
      })
    )
    return { ...page, page: people.filter((person) => person !== null) }
  }
})

export const communityFeed = query({
  args: { code: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { code, paginationOpts }) => {
    const viewer = await accountForCode(ctx, code)
    const accounts = await ctx.db
      .query('accounts')
      .withIndex('by_updated_at')
      .order('desc')
      .paginate(paginationOpts)

    const page = await Promise.all(
      accounts.page.map(async (account) => {
        const checkins = await ctx.db
          .query('checkins')
          .withIndex('by_account_type', (index) =>
            index.eq('accountId', account._id)
          )
          .collect()

        return {
          checkins: checkins.map((checkin) => ({
            code: checkin.locationCode,
            type: checkin.type
          })),
          isCurrentUser: account._id === viewer?._id,
          nickname: account.nickname,
          publicId: account.publicId ?? ''
        }
      })
    )

    return { ...accounts, page }
  }
})

export const profileCheckins = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const account = await ctx.db
      .query('accounts')
      .withIndex('by_public_id', (index) => index.eq('publicId', publicId))
      .unique()
    if (!account || !account.publicId) return null
    const checkins = await ctx.db
      .query('checkins')
      .withIndex('by_account_type', (index) =>
        index.eq('accountId', account._id)
      )
      .collect()
    return {
      nickname: account.nickname,
      publicId: account.publicId,
      checkins: checkins.map((checkin) => ({
        code: checkin.locationCode,
        type: checkin.type
      }))
    }
  }
})
