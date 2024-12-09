import { useConvexClient } from 'convex-svelte';
import type { PageServerLoad } from './$types';
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie
} from '@/lib/server/auth/session';
import { api } from '@/convex/_generated/api';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const token = event.cookies.get('session') ?? null;
  if (token === null) {
    deleteSessionTokenCookie(event);
    throw redirect(302, '/login');
  }

  const client = useConvexClient();

  const { session, user } = await client.mutation(
    api.session.validateSessionToken,
    {
      token
    }
  );

  if (!session || !user) {
    deleteSessionTokenCookie(event);
    throw redirect(302, '/login');
  }

  setSessionTokenCookie(event, token, new Date(session.expiresAt));

  return {
    session,
    user
  };
};
