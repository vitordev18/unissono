import type { AuthRepository } from '../repositories/auth-repository';

export type SignOut = () => Promise<void>;

export function createSignOut(deps: { auth: AuthRepository }): SignOut {
  return async function signOut() {
    await deps.auth.signOut();
  };
}
