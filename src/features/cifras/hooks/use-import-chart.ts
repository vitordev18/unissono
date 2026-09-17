import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { SongChart } from '@/domain/entities/song';
import type { ImportChartInput } from '@/domain/use-cases/import-chart';
import { useUseCases } from '@/services/container-provider';

import { songChartQueryKey } from './use-song-chart';

export function useImportChart(
  songId: string,
): UseMutationResult<SongChart, Error, ImportChartInput> {
  const { importChart } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportChartInput) => importChart(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: songChartQueryKey(songId) });
    },
  });
}
