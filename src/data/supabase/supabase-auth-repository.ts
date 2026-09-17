import type { AuthSession, Credentials } from '@/domain/entities/auth';
import { AuthError } from '@/domain/entities/errors';
import type { AuthRepository } from '@/domain/repositories/auth-repository';

import type { UnissonoClient } from './client';

interface UsuarioDoSupabase {
  id: string;
  email?: string | undefined;
}

function toSession(usuario: UsuarioDoSupabase | null | undefined): AuthSession | null {
  if (!usuario?.email) {
    return null;
  }

  return { userId: usuario.id, email: usuario.email };
}

/**
 * Traduz os erros do Supabase para erros de domínio. A tela nunca vê a
 * mensagem crua do provedor — inclusive porque "Invalid login credentials"
 * não deve virar uma pista sobre qual dos dois campos estava errado.
 */
function traduzirErro(mensagem: string, status?: number): AuthError {
  if (status === 400 || mensagem.toLowerCase().includes('invalid login credentials')) {
    return new AuthError('credenciais-invalidas', 'E-mail ou senha inválidos.');
  }

  if (mensagem.toLowerCase().includes('network') || mensagem.toLowerCase().includes('fetch')) {
    return new AuthError('sem-conexao', 'Sem conexão. Verifique sua internet e tente de novo.');
  }

  return new AuthError('desconhecido', 'Não foi possível concluir. Tente novamente.');
}

export function createSupabaseAuthRepository(client: UnissonoClient): AuthRepository {
  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();

      if (error) {
        throw traduzirErro(error.message, error.status);
      }

      return toSession(data.session?.user);
    },

    async signIn(credentials: Credentials) {
      const { data, error } = await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw traduzirErro(error.message, error.status);
      }

      const session = toSession(data.user);

      if (!session) {
        throw new AuthError('desconhecido', 'Não foi possível concluir. Tente novamente.');
      }

      return session;
    },

    async signOut() {
      const { error } = await client.auth.signOut();

      if (error) {
        throw traduzirErro(error.message, error.status);
      }
    },

    async sendPasswordReset(email: string) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: 'unissono://redefinir-senha',
      });

      if (error) {
        throw traduzirErro(error.message, error.status);
      }
    },

    onSessionChange(listener) {
      const { data } = client.auth.onAuthStateChange((_evento, session) => {
        listener(toSession(session?.user));
      });

      return () => {
        data.subscription.unsubscribe();
      };
    },
  };
}
