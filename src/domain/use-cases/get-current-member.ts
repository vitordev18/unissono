import type { AuthSession } from '../entities/auth';
import { AuthError } from '../entities/errors';
import type { Profile } from '../entities/profile';
import type { AuthRepository } from '../repositories/auth-repository';
import type { ProfileRepository } from '../repositories/profile-repository';

export interface Member {
  session: AuthSession;
  profile: Profile;
}

export type GetCurrentMember = () => Promise<Member | null>;

/**
 * Junta sessão e perfil. Um membro desativado pelo líder tem sessão válida no
 * Auth, mas não é mais membro do ministério — daí o erro explícito.
 */
export function createGetCurrentMember(deps: {
  auth: AuthRepository;
  profiles: ProfileRepository;
}): GetCurrentMember {
  return async function getCurrentMember() {
    const session = await deps.auth.getSession();

    if (!session) {
      return null;
    }

    const profile = await deps.profiles.getById(session.userId);

    if (!profile.isActive) {
      throw new AuthError('conta-inativa', 'Seu acesso ao ministério está desativado.');
    }

    return { session, profile };
  };
}
