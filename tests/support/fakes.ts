import type { AuthSession, Credentials } from '@/domain/entities/auth';
import { AuthError, NotFoundError } from '@/domain/entities/errors';
import type { Profile } from '@/domain/entities/profile';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';

export const perfilDoLider: Profile = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Líder de Teste',
  role: 'lider',
  instrument: 'Violão',
  avatarUrl: null,
  isActive: true,
};

export const perfilDoMusico: Profile = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Músico Um',
  role: 'musico',
  instrument: 'Teclado',
  avatarUrl: null,
  isActive: true,
};

interface FakeAuthOptions {
  sessaoInicial?: AuthSession | null;
  senhaValida?: string;
}

/**
 * Implementação em memória do mesmo contrato usado em produção (LSP).
 * Se o repositório do Supabase e este divergirem, os testes não protegem nada —
 * por isso os dois cumprem exatamente a interface do domínio.
 */
export function createFakeAuthRepository(options: FakeAuthOptions = {}) {
  const senhaValida = options.senhaValida ?? 'senha-correta';
  let sessao: AuthSession | null = options.sessaoInicial ?? null;
  const ouvintes = new Set<(session: AuthSession | null) => void>();

  const repositorio: AuthRepository = {
    getSession: () => Promise.resolve(sessao),

    signIn: (credentials: Credentials) => {
      if (credentials.password !== senhaValida) {
        return Promise.reject(new AuthError('credenciais-invalidas', 'E-mail ou senha inválidos.'));
      }

      sessao = { userId: perfilDoMusico.id, email: credentials.email };
      ouvintes.forEach((ouvinte) => {
        ouvinte(sessao);
      });

      return Promise.resolve(sessao);
    },

    signOut: () => {
      sessao = null;
      ouvintes.forEach((ouvinte) => {
        ouvinte(null);
      });

      return Promise.resolve();
    },

    sendPasswordReset: () => Promise.resolve(),

    onSessionChange: (listener) => {
      ouvintes.add(listener);

      return () => {
        ouvintes.delete(listener);
      };
    },
  };

  return repositorio;
}

export function createFakeProfileRepository(perfis: Profile[] = [perfilDoMusico, perfilDoLider]) {
  const porId = new Map(perfis.map((perfil) => [perfil.id, perfil]));

  const repositorio: ProfileRepository = {
    getById: (id: string) => {
      const perfil = porId.get(id);

      if (!perfil) {
        return Promise.reject(new NotFoundError('Perfil não encontrado para este usuário.'));
      }

      return Promise.resolve(perfil);
    },

    updateOwn: (id, patch) => {
      const perfil = porId.get(id);

      if (!perfil) {
        return Promise.reject(new NotFoundError('Perfil não encontrado para este usuário.'));
      }

      const atualizado: Profile = {
        ...perfil,
        name: patch.name ?? perfil.name,
        instrument: patch.instrument === undefined ? perfil.instrument : patch.instrument,
      };

      porId.set(id, atualizado);

      return Promise.resolve(atualizado);
    },
  };

  return repositorio;
}
