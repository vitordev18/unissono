import * as SecureStore from 'expo-secure-store';

import { secureSessionStorage } from '@/data/supabase/secure-session-storage';

jest.mock('expo-secure-store', () => {
  const cofre = new Map<string, string>();

  return {
    __cofre: cofre,
    getItemAsync: jest.fn((chave: string) => Promise.resolve(cofre.get(chave) ?? null)),
    setItemAsync: jest.fn((chave: string, valor: string) => {
      cofre.set(chave, valor);

      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((chave: string) => {
      cofre.delete(chave);

      return Promise.resolve();
    }),
  };
});

const cofre = (SecureStore as unknown as { __cofre: Map<string, string> }).__cofre;

describe('secureSessionStorage', () => {
  beforeEach(() => {
    cofre.clear();
    jest.clearAllMocks();
  });

  it('devolve null quando não há nada guardado', async () => {
    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBeNull();
  });

  it('guarda e recupera uma sessão maior que o limite do armazenamento seguro', async () => {
    const sessao = 'a'.repeat(5_000);

    await secureSessionStorage.setItem('sb-auth-token', sessao);

    // Fatiado: nenhum item isolado passa do tamanho aceito pela plataforma.
    for (const [chave, valor] of cofre) {
      if (!chave.endsWith('.n')) {
        expect(valor.length).toBeLessThanOrEqual(1800);
      }
    }

    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBe(sessao);
  });

  it('não deixa pedaços órfãos ao substituir por uma sessão menor', async () => {
    await secureSessionStorage.setItem('sb-auth-token', 'a'.repeat(5_000));
    await secureSessionStorage.setItem('sb-auth-token', 'b'.repeat(100));

    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBe('b'.repeat(100));
    expect(cofre.size).toBe(2); // um pedaço + o índice
  });

  it('descarta a sessão inteira se um pedaço sumir', async () => {
    await secureSessionStorage.setItem('sb-auth-token', 'a'.repeat(5_000));
    cofre.delete('sb-auth-token.1');

    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBeNull();
    expect(cofre.size).toBe(0);
  });

  it('remove índice e pedaços no logout', async () => {
    await secureSessionStorage.setItem('sb-auth-token', 'a'.repeat(4_000));
    await secureSessionStorage.removeItem('sb-auth-token');

    expect(cofre.size).toBe(0);
  });
});
