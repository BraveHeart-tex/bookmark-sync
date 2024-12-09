import type { Session, User } from '@/convex/types';

export interface GoogleAuthClaims {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
