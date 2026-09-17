import { profileSchema, type Profile } from '@/domain/entities/profile';

import type { Database } from './database.types';

/** Só as colunas que a entidade precisa — o select pede exatamente estas. */
export type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'name' | 'role' | 'instrument' | 'avatar_url' | 'is_active'
>;

/**
 * Fronteira de dados: a linha do Postgres só vira entidade depois de passar
 * pelo Zod. Se o banco mudar sem o app saber, o erro aparece aqui — e não como
 * um `undefined` no meio da tela.
 */
export function rowToProfile(row: ProfileRow): Profile {
  return profileSchema.parse({
    id: row.id,
    name: row.name,
    role: row.role,
    instrument: row.instrument,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
  });
}
