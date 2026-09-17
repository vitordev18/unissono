import { createClient } from '@supabase/supabase-js';

import type { TestDatabase } from './database.types';

import { supabaseAnonKey, supabaseUrl } from './env';

/** Contas criadas por supabase/seed.sql — apenas no projeto de desenvolvimento. */
export const testAccounts = {
  lider: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'lider@unissono.test',
  },
  musico1: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'musico1@unissono.test',
  },
  musico2: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'musico2@unissono.test',
  },
} as const;

export const testPassword = 'Unissono!Teste123';

export const seedIds = {
  songA: 'aaaaaaaa-0000-4000-8000-000000000001',
  songB: 'aaaaaaaa-0000-4000-8000-000000000002',
  songC: 'aaaaaaaa-0000-4000-8000-000000000003',
  publishedSchedule: 'bbbbbbbb-0000-4000-8000-000000000001',
  draftSchedule: 'bbbbbbbb-0000-4000-8000-000000000002',
  repertoire: 'cccccccc-0000-4000-8000-000000000001',
} as const;

/** Cliente tipado pelo esquema em database.types.ts (substituído na Fase 3). */
export type TestClient = ReturnType<typeof createClient<TestDatabase>>;

export function createAnonymousClient(): TestClient {
  return createClient<TestDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * Cliente autenticado como uma das contas de teste. Cada teste usa o seu
 * próprio cliente: é assim que a RLS é exercitada de verdade, com o JWT do
 * usuário, e não com uma chave administrativa.
 */
export async function signInAs(account: keyof typeof testAccounts): Promise<TestClient> {
  const client = createAnonymousClient();
  let ultimaFalha = '';

  // O GoTrue limita a taxa de autenticações. Com quatro arquivos de teste em
  // paralelo, uma tentativa isolada falha de vez em quando — daí a repetição.
  for (let tentativa = 1; tentativa <= 3; tentativa += 1) {
    const { error } = await client.auth.signInWithPassword({
      email: testAccounts[account].email,
      password: testPassword,
    });

    if (!error) {
      return client;
    }

    ultimaFalha = error.message;
    await new Promise((resolve) => setTimeout(resolve, tentativa * 500));
  }

  throw new Error(`Falha ao autenticar como ${account}: ${ultimaFalha}`);
}
