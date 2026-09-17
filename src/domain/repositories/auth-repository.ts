import type { AuthSession, Credentials } from '../entities/auth';

/** Contrato pequeno e específico (ISP): só autenticação, nada de perfil. */
export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  signIn(credentials: Credentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  /** Devolve a função de cancelamento da inscrição (padrão Observer). */
  onSessionChange(listener: (session: AuthSession | null) => void): () => void;
}
