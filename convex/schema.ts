import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const locationType = v.union(
  v.literal('country'),
  v.literal('province'),
  v.literal('ward')
)

export default defineSchema({
  accounts: defineTable({
    code: v.string(),
    createdAt: v.number(),
    nickname: v.string(),
    updatedAt: v.number()
  }).index('by_code', ['code']),
  checkins: defineTable({
    accountId: v.id('accounts'),
    createdAt: v.number(),
    locationCode: v.string(),
    type: locationType
  })
    .index('by_account_type', ['accountId', 'type'])
    .index('by_account_type_code', ['accountId', 'type', 'locationCode'])
    .index('by_type', ['type']),
  wishlistEmails: defineTable({
    createdAt: v.number(),
    email: v.string()
  }).index('by_email', ['email'])
})
