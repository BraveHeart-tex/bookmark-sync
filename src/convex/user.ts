import { v } from 'convex/values';
import { query } from './_generated/server';

export const getUserFromGoogleId = query({
  args: {
    googleId: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('user')
      .withIndex('byGoogleId', ({ eq }) => eq('googleId', args.googleId))
      .first();

    return user;
  }
});
