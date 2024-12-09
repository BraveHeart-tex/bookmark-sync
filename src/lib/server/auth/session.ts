import type { SessionValidationResult } from '@/lib/server/auth/types';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase
} from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import {
  createUserSession,
  deleteUserSession,
  getSessionWithUserInformation,
  updateSessionExpiresAt
} from '@/convex/auth/session';
import type { MutationCtx } from '@/convex/_generated/server';
import type { DataModel, Id } from '@/convex/_generated/dataModel';
import type { GenericMutationCtx, WithoutSystemFields } from 'convex/server';
import type { Session } from '@/convex/types';

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export const createSession = async ({
  ctx,
  token,
  userId
}: {
  ctx: MutationCtx;
  token: string;
  userId: Id<'user'>;
}): Promise<WithoutSystemFields<Session>> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: WithoutSystemFields<Session> = {
    id: sessionId,
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30
  };

  await createUserSession(ctx, session);

  return session;
};

export const validateSessionToken = async (
  ctx: GenericMutationCtx<DataModel>,
  token: string
): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const { user, session: sessionRow } = await getSessionWithUserInformation(
    ctx,
    {
      sessionId
    }
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
    await deleteUserSession(ctx, {
      id: sessionRow._id
    });
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
};

export const invalidateSession = (sessionId: string): Promise<void> => {
  // TODO
};
