import { emailSchema } from '../entities/auth';
import { AuthError } from '../entities/errors';
import type { AuthRepository } from '../repositories/auth-repository';

export type RequestPasswordReset = (email: string) => Promise<void>;

export function createRequestPasswordReset(deps: { auth: AuthRepository }): RequestPasswordReset {
  return async function requestPasswordReset(email) {
    const validacao = emailSchema.safeParse(email);

    if (!validacao.success) {
      throw new AuthError('dados-invalidos', 'Informe um e-mail válido');
    }

    await deps.auth.sendPasswordReset(validacao.data);
  };
}
