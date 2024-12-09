import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { Id } from '@/convex/_generated/dataModel';
import type { WithoutSystemFields } from 'convex/server';
import type { Session } from '@/convex/types';
import type { RequestEvent } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '@/constants';
import { useConvexClient } from 'convex-svelte';
import { api } from '@/convex/_generated/api';

export function setSessionTokenCookie(
  event: RequestEvent,
  token: string,
  expiresAt: Date
): void {
  event.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
  event.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export const createSession = async ({
  token,
  userId
}: {
  token: string;
  userId: Id<'user'>;
}): Promise<WithoutSystemFields<Session>> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: WithoutSystemFields<Session> = {
    id: sessionId,
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30
  };

  const client = useConvexClient();

  await client.mutation(api.session.createUserSession, {
    ...session
  });

  return session;
};
