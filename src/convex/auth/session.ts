import { internalMutation, internalQuery } from '@/convex/_generated/server';
import { v } from 'convex/values';

export const createUserSession = internalMutation({
  args: {
    id: v.string(),
    userId: v.id('user'),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('userSession', {
      id: args.id,
      expiresAt: args.expiresAt,
      userId: args.userId
    });
  }
});

export const deleteUserSession = internalMutation({
  args: {
    id: v.id('userSession')
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  }
});

export const getSessionWithUserInformation = internalQuery({
  args: {
    sessionId: v.string()
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('userSession')
      .withIndex('bySessionId', ({ eq }) => eq('id', args.sessionId))
      .first();

    if (!session) {
      return {
        user: null,
        session: null
      };
    }

    const user = await ctx.db.get(session.userId);

    if (!user) {
      return {
        user: null,
        session: null
      };
    }

    return {
      user,
      session
    };
  }
});

export const updateSessionExpiresAt = internalMutation({
  args: {
    id: v.id('userSession'),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      expiresAt: args.expiresAt
    });
  }
});
