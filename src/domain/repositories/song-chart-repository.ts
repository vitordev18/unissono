import type { SongChart } from '../entities/song';

export interface NewSongChart {
  songId: string;
  contentChordPro: string;
  key: string;
}

export interface SongChartRepository {
  /** Versão mais recente; null quando a música ainda não tem cifra. */
  getLatest(songId: string): Promise<SongChart | null>;
  listVersions(songId: string): Promise<SongChart[]>;
  create(input: NewSongChart): Promise<SongChart>;
}
