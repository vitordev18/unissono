import { ForbiddenError, NotFoundError } from '@/domain/entities/errors';
import type { NewSong, Song } from '@/domain/entities/song';
import type { SongFilter, SongRepository } from '@/domain/repositories/song-repository';

import type { UnissonoClient } from './client';
import { normalizeSearchTerm, rowToSong } from './song-mapper';

const COLUNAS = 'id, title, artist, default_key, bpm, tags, youtube_url';
const LIMITE = 100;

export function createSupabaseSongRepository(client: UnissonoClient): SongRepository {
  return {
    async search(filter: SongFilter): Promise<Song[]> {
      let consulta = client.from('songs').select(COLUNAS).order('title').limit(LIMITE);

      if (filter.term !== undefined && filter.term.trim().length > 0) {
        consulta = consulta.ilike('search_text', `%${normalizeSearchTerm(filter.term)}%`);
      }

      if (filter.tags !== undefined && filter.tags.length > 0) {
        consulta = consulta.contains('tags', filter.tags);
      }

      const { data, error } = await consulta;

      if (error) {
        throw new Error(`Não foi possível buscar músicas: ${error.message}`);
      }

      return data.map(rowToSong);
    },

    async getById(id: string): Promise<Song> {
      const { data, error } = await client.from('songs').select(COLUNAS).eq('id', id).maybeSingle();

      if (error) {
        throw new Error(`Não foi possível carregar a música: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError('Música não encontrada.');
      }

      return rowToSong(data);
    },

    async create(input: NewSong): Promise<Song> {
      const { data, error } = await client
        .from('songs')
        .insert({
          title: input.title,
          artist: input.artist,
          default_key: input.defaultKey,
          bpm: input.bpm,
          tags: input.tags,
        })
        .select(COLUNAS)
        .single();

      if (error) {
        throw new Error(`Não foi possível salvar a música: ${error.message}`);
      }

      return rowToSong(data);
    },

    async setYoutubeUrl(id: string, youtubeUrl: string | null): Promise<Song> {
      const { data, error } = await client
        .from('songs')
        .update({ youtube_url: youtubeUrl })
        .eq('id', id)
        .select(COLUNAS)
        .maybeSingle();

      if (error) {
        throw new Error(`Não foi possível vincular o vídeo: ${error.message}`);
      }

      // Sem linha significa RLS: quem não é líder não altera o catálogo.
      if (!data) {
        throw new ForbiddenError('Apenas a liderança pode vincular o vídeo.');
      }

      return rowToSong(data);
    },
  };
}
