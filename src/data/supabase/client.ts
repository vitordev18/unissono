import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';
import { readSupabaseEnv, type SupabaseEnv } from './env';
import { secureSessionStorage } from './secure-session-storage';

export type UnissonoClient = SupabaseClient<Database>;

export interface ClientOptions {
  env?: SupabaseEnv;
  /** Injetável para teste; em produção é o armazenamento seguro da plataforma. */
  storage?: {
    getItem: (chave: string) => Promise<string | null>;
    setItem: (chave: string, valor: string) => Promise<void>;
    removeItem: (chave: string) => Promise<void>;
  };
}

/** Factory: um client por ambiente (padrão Factory da arquitetura). */
export function createSupabaseClient(options: ClientOptions = {}): UnissonoClient {
  const env = options.env ?? readSupabaseEnv();

  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: options.storage ?? secureSessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Sem URL de callback no app nativo: o deep link é tratado pelo roteador.
      detectSessionInUrl: false,
    },
  });
}
