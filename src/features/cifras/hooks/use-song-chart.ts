import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { SongWithChart } from '@/domain/use-cases/get-song-chart';
import { useUseCases } from '@/services/container-provider';

export function songChartQueryKey(songId: string) {
  return ['song', songId, 'chart'] as const;
}

export function useSongChart(songId: string): UseQueryResult<SongWithChart> {
  const { getSongChart } = useUseCases();

  return useQuery({
    queryKey: songChartQueryKey(songId),
    queryFn: () => getSongChart(songId),
  });
}
