import { songChartSchema, songSchema, type Song, type SongChart } from '@/domain/entities/song';

import type { Database } from './database.types';

export type SongRow = Pick<
  Database['public']['Tables']['songs']['Row'],
  'id' | 'title' | 'artist' | 'default_key' | 'bpm' | 'tags' | 'youtube_url'
>;

export type SongChartRow = Pick<
  Database['public']['Tables']['song_charts']['Row'],
  'id' | 'song_id' | 'content_chordpro' | 'key' | 'version' | 'created_at'
>;

export function rowToSong(row: SongRow): Song {
  return songSchema.parse({
    id: row.id,
    title: row.title,
    artist: row.artist,
    defaultKey: row.default_key,
    bpm: row.bpm,
    tags: row.tags,
    youtubeUrl: row.youtube_url,
  });
}

export function rowToSongChart(row: SongChartRow): SongChart {
  return songChartSchema.parse({
    id: row.id,
    songId: row.song_id,
    contentChordPro: row.content_chordpro,
    key: row.key,
    version: row.version,
    createdAt: row.created_at,
  });
}

/**
 * A coluna search_text do Postgres guarda o texto sem acento; o termo digitado
 * precisa passar pela mesma normalização, senão "coracao" não acha "Coração".
 */
export function normalizeSearchTerm(termo: string): string {
  return termo
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
