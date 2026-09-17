import { ForbiddenError, NotFoundError } from '@/domain/entities/errors';
import type { Profile } from '@/domain/entities/profile';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';

import type { UnissonoClient } from './client';
import { rowToProfile } from './profile-mapper';

export function createSupabaseProfileRepository(client: UnissonoClient): ProfileRepository {
  return {
    async getById(id: string): Promise<Profile> {
      const { data, error } = await client
        .from('profiles')
        .select('id, name, role, instrument, avatar_url, is_active')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Não foi possível carregar o perfil: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Perfil não encontrado para este usuário.');
      }

      return rowToProfile(data);
    },

    async updateOwn(id, patch): Promise<Profile> {
      const { data, error } = await client
        .from('profiles')
        .update(patch)
        .eq('id', id)
        .select('id, name, role, instrument, avatar_url, is_active')
        .maybeSingle();

      if (error) {
        throw new Error(`Não foi possível salvar o perfil: ${error.message}`);
      }

      // A RLS não devolve erro quando a linha não é sua: devolve nenhuma linha.
      if (!data) {
        throw new ForbiddenError('Você não tem permissão para editar este perfil.');
      }

      return rowToProfile(data);
    },
  };
}
