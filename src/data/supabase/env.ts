import { z } from 'zod';

/**
 * As variáveis EXPO_PUBLIC_* são embutidas no bundle e, portanto, públicas.
 * A proteção dos dados vem da RLS, não do sigilo destas chaves. O que não pode
 * acontecer é o app subir sem elas: por isso a validação falha rápido, no boot.
 */
const envSchema = z.object({
  supabaseUrl: z.url({ message: 'EXPO_PUBLIC_SUPABASE_URL precisa ser uma URL válida' }),
  supabaseAnonKey: z
    .string()
    .min(20, { message: 'EXPO_PUBLIC_SUPABASE_ANON_KEY ausente ou inválida' }),
});

export type SupabaseEnv = z.infer<typeof envSchema>;

export function readSupabaseEnv(
  source: Record<string, string | undefined> = process.env,
): SupabaseEnv {
  const resultado = envSchema.safeParse({
    supabaseUrl: source['EXPO_PUBLIC_SUPABASE_URL'],
    supabaseAnonKey: source['EXPO_PUBLIC_SUPABASE_ANON_KEY'],
  });

  if (!resultado.success) {
    const detalhes = resultado.error.issues.map((problema) => problema.message).join('; ');

    throw new Error(
      `Configuração do Supabase ausente ou inválida: ${detalhes}. Copie .env.example para .env.`,
    );
  }

  return resultado.data;
}
