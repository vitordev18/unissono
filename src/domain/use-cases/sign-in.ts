import { credentialsSchema, type AuthSession } from '../entities/auth';
import { AuthError } from '../entities/errors';
import type { AuthRepository } from '../repositories/auth-repository';

export type SignIn = (input: { email: string; password: string }) => Promise<AuthSession>;

export function createSignIn(deps: { auth: AuthRepository }): SignIn {
  return async function signIn(input) {
    const validacao = credentialsSchema.safeParse(input);

    if (!validacao.success) {
      const primeiro = validacao.error.issues[0];

      throw new AuthError('dados-invalidos', primeiro?.message ?? 'Dados inválidos');
    }

    return deps.auth.signIn(validacao.data);
  };
}
