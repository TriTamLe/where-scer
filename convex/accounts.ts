import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const SPECIAL_ACCOUNT_CODE = 'SC-ORIGIN'
export const SPECIAL_ACCOUNT_NICKNAME = 'Người giữ bản đồ'

const DEMO_ACCOUNTS = [
  { code: 'SC-DEMO01', nickname: 'Rái Cá Lấp Lánh' },
  { code: 'SC-DEMO02', nickname: 'Cú Mèo Tò Mò' },
  { code: 'SC-DEMO03', nickname: 'Gấu Trúc Vui Vẻ' },
  { code: 'SC-DEMO04', nickname: 'Cáo Đầy Nắng' },
  { code: 'SC-DEMO05', nickname: 'Thỏ Năng Động' }
] as const

const DEMO_CHECKINS = {
  'SC-DEMO01': [
    ['country', '704'],
    ['country', '840'],
    ['province', '48'],
    ['ward', '20194']
  ],
  'SC-DEMO02': [
    ['country', '704'],
    ['country', '392'],
    ['province', '48'],
    ['ward', '20197']
  ],
  'SC-DEMO03': [
    ['country', '704'],
    ['province', '79']
  ],
  'SC-DEMO04': [
    ['country', '840'],
    ['country', '826'],
    ['province', '48'],
    ['ward', '20200']
  ],
  'SC-DEMO05': [
    ['country', '704'],
    ['country', '036'],
    ['province', '48'],
    ['ward', '20194']
  ]
} as const

const codeValidator = v.string()

function normalizeCode(code: string) {
  return code.trim().toUpperCase()
}

function normalizeNickname(nickname: string) {
  return nickname
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(
      (word) =>
        word.charAt(0).toLocaleUpperCase('vi-VN') +
        word.slice(1).toLocaleLowerCase('vi-VN')
    )
    .join(' ')
}

function createCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''

  for (let index = 0; index < 6; index += 1) {
    suffix += characters[Math.floor(Math.random() * characters.length)]
  }

  return `SC-${suffix}`
}

export const getByCode = query({
  args: { code: codeValidator },
  handler: async (ctx, { code }) => {
    const account = await ctx.db
      .query('accounts')
      .withIndex('by_code', (index) => index.eq('code', normalizeCode(code)))
      .unique()

    return account ? { code: account.code, nickname: account.nickname } : null
  }
})

export const create = mutation({
  args: { nickname: v.string() },
  handler: async (ctx, { nickname }) => {
    const normalizedNickname = normalizeNickname(nickname)
    if (normalizedNickname.length < 2 || normalizedNickname.length > 48) {
      throw new Error('Nickname cần có từ 2 đến 48 ký tự.')
    }

    let code = createCode()
    while (
      code === SPECIAL_ACCOUNT_CODE ||
      (await ctx.db
        .query('accounts')
        .withIndex('by_code', (index) => index.eq('code', code))
        .unique())
    ) {
      code = createCode()
    }

    const now = Date.now()
    await ctx.db.insert('accounts', {
      code,
      createdAt: now,
      nickname: normalizedNickname,
      updatedAt: now
    })

    return { code, nickname: normalizedNickname }
  }
})

export const updateNickname = mutation({
  args: { code: codeValidator, nickname: v.string() },
  handler: async (ctx, { code, nickname }) => {
    const normalizedNickname = normalizeNickname(nickname)
    if (normalizedNickname.length < 2 || normalizedNickname.length > 48) {
      throw new Error('Nickname cần có từ 2 đến 48 ký tự.')
    }

    const account = await ctx.db
      .query('accounts')
      .withIndex('by_code', (index) => index.eq('code', normalizeCode(code)))
      .unique()
    if (!account) throw new Error('Không tìm thấy account này.')

    await ctx.db.patch(account._id, {
      nickname: normalizedNickname,
      updatedAt: Date.now()
    })

    return { nickname: normalizedNickname }
  }
})

export const normalizeAllNicknames = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query('accounts').collect()
    let updated = 0

    for (const account of accounts) {
      const nickname = normalizeNickname(account.nickname)
      if (nickname === account.nickname) continue
      await ctx.db.patch(account._id, { nickname, updatedAt: Date.now() })
      updated += 1
    }

    return { updated }
  }
})

export const seedSpecial = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('accounts')
      .withIndex('by_code', (index) => index.eq('code', SPECIAL_ACCOUNT_CODE))
      .unique()
    if (existing) return { created: false, code: SPECIAL_ACCOUNT_CODE }

    const now = Date.now()
    await ctx.db.insert('accounts', {
      code: SPECIAL_ACCOUNT_CODE,
      createdAt: now,
      nickname: SPECIAL_ACCOUNT_NICKNAME,
      updatedAt: now
    })
    return { created: true, code: SPECIAL_ACCOUNT_CODE }
  }
})

export const seedDemoAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const created: string[] = []
    let checkinsCreated = 0

    for (const demoAccount of DEMO_ACCOUNTS) {
      let account = await ctx.db
        .query('accounts')
        .withIndex('by_code', (index) => index.eq('code', demoAccount.code))
        .unique()

      if (!account) {
        const now = Date.now()
        const accountId = await ctx.db.insert('accounts', {
          code: demoAccount.code,
          createdAt: now,
          nickname: demoAccount.nickname,
          updatedAt: now
        })
        account = await ctx.db.get(accountId)
        created.push(demoAccount.code)
      } else if (account.nickname !== demoAccount.nickname) {
        await ctx.db.patch(account._id, {
          nickname: demoAccount.nickname,
          updatedAt: Date.now()
        })
      }
      if (!account) continue

      const existingCheckins = await ctx.db
        .query('checkins')
        .withIndex('by_account_type', (index) =>
          index.eq('accountId', account._id)
        )
        .collect()
      for (const [type, locationCode] of DEMO_CHECKINS[demoAccount.code]) {
        const exists = existingCheckins.some(
          (checkin) =>
            checkin.type === type && checkin.locationCode === locationCode
        )
        if (exists) continue
        await ctx.db.insert('checkins', {
          accountId: account._id,
          createdAt: Date.now(),
          locationCode,
          type
        })
        checkinsCreated += 1
      }
    }

    return {
      created,
      checkinsCreated,
      skipped: DEMO_ACCOUNTS.length - created.length
    }
  }
})
