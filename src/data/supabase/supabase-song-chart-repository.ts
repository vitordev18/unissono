import type { SongChart } from '@/domain/entities/song';
import type {
  NewSongChart,
  SongChartRepository,
} from '@/domain/repositories/song-chart-repository';

import type { UnissonoClient } from './client';
import { rowToSongChart } from './song-mapper';

const COLUNAS = 'id, song_id, content_chordpro, key, version, created_at';

export function createSupabaseSongChartRepository(client: UnissonoClient): SongChartRepository {
  return {
    async getLatest(songId: string): Promise<SongChart | null> {
      const { data, error } = await client
        .from('song_charts')
        .select(COLUNAS)
        .eq('song_id', songId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Não foi possível carregar a cifra: ${error.message}`);
      }

      return data === null ? null : rowToSongChart(data);
    },

    async listVersions(songId: string): Promise<SongChart[]> {
      const { data, error } = await client
        .from('song_charts')
        .select(COLUNAS)
        .eq('song_id', songId)
        .order('version', { ascending: false });

      if (error) {
        throw new Error(`Não foi possível listar as versões: ${error.message}`);
      }

      return data.map(rowToSongChart);
    },

    async create(input: NewSongChart): Promise<SongChart> {
      // A versão é atribuída pelo banco (trigger song_charts_set_version).
      const { data, error } = await client
        .from('song_charts')
        .insert({
          song_id: input.songId,
          content_chordpro: input.contentChordPro,
          key: input.key,
        })
        .select(COLUNAS)
        .single();

      if (error) {
        throw new Error(`Não foi possível salvar a cifra: ${error.message}`);
      }

      return rowToSongChart(data);
    },
  };
}
