import { v } from 'convex/values';
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
  user: defineTable({
    googleId: v.string(),
    name: v.string()
  }).index('byGoogleId', ['googleId']),
  userSession: defineTable({
    id: v.string(),
    userId: v.id('user'),
    expiresAt: v.number()
  })
    .index('byUserId', ['userId'])
    .index('bySessionId', ['id'])
});
