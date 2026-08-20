import { v } from 'convex/values'

import { mutation } from './_generated/server'

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Email chưa đúng định dạng.')
    }
    const existing = await ctx.db
      .query('wishlistEmails')
      .withIndex('by_email', (index) => index.eq('email', normalizedEmail))
      .unique()
    if (existing) return { created: false }
    await ctx.db.insert('wishlistEmails', {
      createdAt: Date.now(),
      email: normalizedEmail
    })
    return { created: true }
  }
})
