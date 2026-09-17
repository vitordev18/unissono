import { readSupabaseEnv } from '@/data/supabase/env';
import { rowToProfile } from '@/data/supabase/profile-mapper';

describe('readSupabaseEnv', () => {
  it('aceita configuração completa', () => {
    const env = readSupabaseEnv({
      EXPO_PUBLIC_SUPABASE_URL: 'https://projeto.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_chave_de_exemplo',
    });

    expect(env.supabaseUrl).toBe('https://projeto.supabase.co');
  });

  it('falha com mensagem acionável quando falta configuração', () => {
    expect(() => readSupabaseEnv({})).toThrow('Copie .env.example para .env');
  });

  it('recusa URL inválida', () => {
    expect(() =>
      readSupabaseEnv({
        EXPO_PUBLIC_SUPABASE_URL: 'projeto.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_chave_de_exemplo',
      }),
    ).toThrow('URL válida');
  });
});

describe('rowToProfile', () => {
  it('converte a linha do Postgres em entidade de domínio', () => {
    const profile = rowToProfile({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Líder de Teste',
      role: 'lider',
      instrument: 'Violão',
      avatar_url: null,
      is_active: true,
    });

    expect(profile).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Líder de Teste',
      role: 'lider',
      instrument: 'Violão',
      avatarUrl: null,
      isActive: true,
    });
  });

  it('recusa papel desconhecido vindo do banco', () => {
    expect(() =>
      rowToProfile({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Alguém',
        role: 'administrador' as 'lider',
        instrument: null,
        avatar_url: null,
        is_active: true,
      }),
    ).toThrow();
  });
});
