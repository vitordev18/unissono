import { AuthError } from '@/domain/entities/errors';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import { createGetCurrentMember } from '@/domain/use-cases/get-current-member';
import { createRequestPasswordReset } from '@/domain/use-cases/request-password-reset';
import { createSignIn } from '@/domain/use-cases/sign-in';

import {
  createFakeAuthRepository,
  createFakeProfileRepository,
  perfilDoMusico,
} from '../support/fakes';

describe('createSignIn', () => {
  it('recusa e-mail inválido antes de chamar o repositório', async () => {
    const auth = createFakeAuthRepository();
    const espiao = jest.spyOn(auth, 'signIn');
    const signIn = createSignIn({ auth });

    await expect(signIn({ email: 'nao-e-email', password: 'senha-correta' })).rejects.toThrow(
      AuthError,
    );
    expect(espiao).not.toHaveBeenCalled();
  });

  it('recusa senha curta', async () => {
    const signIn = createSignIn({ auth: createFakeAuthRepository() });

    await expect(signIn({ email: 'musico@igreja.com', password: '123' })).rejects.toThrow(
      'A senha precisa ter ao menos 8 caracteres',
    );
  });

  it('normaliza o e-mail antes de autenticar', async () => {
    const auth = createFakeAuthRepository();
    const espiao = jest.spyOn(auth, 'signIn');
    const signIn = createSignIn({ auth });

    await signIn({ email: '  Musico@Igreja.COM ', password: 'senha-correta' });

    expect(espiao).toHaveBeenCalledWith({
      email: 'musico@igreja.com',
      password: 'senha-correta',
    });
  });

  it('propaga credenciais inválidas como erro de domínio', async () => {
    const signIn = createSignIn({ auth: createFakeAuthRepository() });

    await expect(signIn({ email: 'musico@igreja.com', password: 'senha-errada' })).rejects.toThrow(
      'E-mail ou senha inválidos.',
    );
  });
});

describe('createGetCurrentMember', () => {
  const profiles = createFakeProfileRepository();

  it('devolve null sem sessão', async () => {
    const getCurrentMember = createGetCurrentMember({
      auth: createFakeAuthRepository(),
      profiles,
    });

    await expect(getCurrentMember()).resolves.toBeNull();
  });

  it('junta sessão e perfil do membro', async () => {
    const auth = createFakeAuthRepository({
      sessaoInicial: { userId: perfilDoMusico.id, email: 'musico@igreja.com' },
    });
    const getCurrentMember = createGetCurrentMember({ auth, profiles });

    const membro = await getCurrentMember();

    expect(membro?.profile.name).toBe('Músico Um');
    expect(membro?.session.email).toBe('musico@igreja.com');
  });

  it('recusa membro desativado mesmo com sessão válida', async () => {
    const auth = createFakeAuthRepository({
      sessaoInicial: { userId: perfilDoMusico.id, email: 'musico@igreja.com' },
    });
    const getCurrentMember = createGetCurrentMember({
      auth,
      profiles: createFakeProfileRepository([{ ...perfilDoMusico, isActive: false }]),
    });

    await expect(getCurrentMember()).rejects.toMatchObject({ code: 'conta-inativa' });
  });
});

describe('createRequestPasswordReset', () => {
  it('valida o e-mail antes de pedir o link', async () => {
    const auth: AuthRepository = createFakeAuthRepository();
    const espiao = jest.spyOn(auth, 'sendPasswordReset');
    const requestPasswordReset = createRequestPasswordReset({ auth });

    await expect(requestPasswordReset('sem-arroba')).rejects.toThrow('Informe um e-mail válido');
    expect(espiao).not.toHaveBeenCalled();

    await requestPasswordReset(' Musico@Igreja.com ');
    expect(espiao).toHaveBeenCalledWith('musico@igreja.com');
  });
});
