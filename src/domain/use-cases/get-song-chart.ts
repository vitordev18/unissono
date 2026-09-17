import { parseChart } from '@/utils/chords';
import type { ChartDocument } from '@/utils/chords';

import type { Song, SongChart } from '../entities/song';
import type { SongChartRepository } from '../repositories/song-chart-repository';
import type { SongRepository } from '../repositories/song-repository';

export interface SongWithChart {
  song: Song;
  chart: SongChart | null;
  /** Documento já interpretado; null quando a música ainda não tem cifra. */
  document: ChartDocument | null;
}

export type GetSongChart = (songId: string) => Promise<SongWithChart>;

export function createGetSongChart(deps: {
  songs: SongRepository;
  charts: SongChartRepository;
}): GetSongChart {
  return async function getSongChart(songId) {
    const [song, chart] = await Promise.all([
      deps.songs.getById(songId),
      deps.charts.getLatest(songId),
    ]);

    return {
      song,
      chart,
      document: chart === null ? null : parseChart(chart.contentChordPro, 'chordpro'),
    };
  };
}
