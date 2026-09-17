import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * O expo-modules-core amplia NodeJS.ProcessEnv com `[key: string]: any`, e o
 * `expo-env.d.ts` que corrige isso é gerado pelo Expo e não vai para o
 * repositório — então no CI todo acesso a process.env vira `any` e o lint
 * estrito reprova. Declarar a forma esperada aqui torna o tipo independente de
 * arquivo gerado.
 */
const ambiente = process.env as Record<string, string | undefined>;

/**
 * Carrega o .env da raiz para process.env. O Expo faz isso em tempo de
 * execução do app; o Jest, não. Um parser de 20 linhas evita mais uma
 * dependência só para os testes.
 */
function loadEnvFile(): void {
  let content: string;

  try {
    content = readFileSync(join(__dirname, '..', '..', '.env'), 'utf8');
  } catch {
    return;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    ambiente[key] ??= value;
  }
}

loadEnvFile();

export const supabaseUrl = ambiente['EXPO_PUBLIC_SUPABASE_URL'] ?? '';
export const supabaseAnonKey = ambiente['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

/** Os testes de RLS só rodam com um projeto Supabase configurado. */
export const hasSupabaseCredentials = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
