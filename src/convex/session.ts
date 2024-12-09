import { mutation, query } from '@/convex/_generated/server';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { v } from 'convex/values';

export const validateSessionToken = mutation({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const token = args.token;
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    );

    const { user, session: sessionRow } = await getSessionWithUserInformation(
      ctx,
      { sessionId }
    );

    if (!user || !sessionRow) {
      return {
        session: null,
        user: null
      };
    }

    const session = {
      id: sessionRow.id,
      userId: sessionRow.userId,
      expiresAt: sessionRow.expiresAt
    };

    if (Date.now() >= session.expiresAt) {
      await invalidateUserSession(ctx, { sessionId: sessionRow._id });

      return {
        session: null,
        user: null
      };
    }

    if (Date.now() >= session.expiresAt - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
      await updateSessionExpiresAt(ctx, {
        id: sessionRow._id,
        expiresAt: session.expiresAt
      });
    }

    return {
      session: sessionRow,
      user
    };
  }
});

export const createUserSession = mutation({
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

export const invalidateUserSession = mutation({
  args: {
    sessionId: v.id('userSession')
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.sessionId);
  }
});

export const getSessionWithUserInformation = query({
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

export const updateSessionExpiresAt = mutation({
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
