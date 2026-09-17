import { createSupabaseAuthRepository } from '@/data/supabase/supabase-auth-repository';
import { createSupabaseProfileRepository } from '@/data/supabase/supabase-profile-repository';
import { createSupabaseClient, type ClientOptions } from '@/data/supabase/client';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';
import {
  createGetCurrentMember,
  type GetCurrentMember,
} from '@/domain/use-cases/get-current-member';
import {
  createRequestPasswordReset,
  type RequestPasswordReset,
} from '@/domain/use-cases/request-password-reset';
import { createSignIn, type SignIn } from '@/domain/use-cases/sign-in';
import { createSignOut, type SignOut } from '@/domain/use-cases/sign-out';

export interface Repositories {
  auth: AuthRepository;
  profiles: ProfileRepository;
}

export interface UseCases {
  signIn: SignIn;
  signOut: SignOut;
  requestPasswordReset: RequestPasswordReset;
  getCurrentMember: GetCurrentMember;
}

export interface Container {
  repositories: Repositories;
  useCases: UseCases;
}

/** Único lugar do app que conhece implementações concretas (composition root). */
export function createContainer(options: ClientOptions = {}): Container {
  const client = createSupabaseClient(options);

  return createContainerFrom({
    auth: createSupabaseAuthRepository(client),
    profiles: createSupabaseProfileRepository(client),
  });
}

/** Monta os use-cases sobre quaisquer repositórios — inclusive os de teste. */
export function createContainerFrom(repositories: Repositories): Container {
  return {
    repositories,
    useCases: {
      signIn: createSignIn({ auth: repositories.auth }),
      signOut: createSignOut({ auth: repositories.auth }),
      requestPasswordReset: createRequestPasswordReset({ auth: repositories.auth }),
      getCurrentMember: createGetCurrentMember({
        auth: repositories.auth,
        profiles: repositories.profiles,
      }),
    },
  };
}
