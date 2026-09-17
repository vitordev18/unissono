import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

    process.env[key] ??= value;
  }
}

loadEnvFile();

export const supabaseUrl = process.env['EXPO_PUBLIC_SUPABASE_URL'] ?? '';
export const supabaseAnonKey = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ?? '';

/** Os testes de RLS só rodam com um projeto Supabase configurado. */
export const hasSupabaseCredentials = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
