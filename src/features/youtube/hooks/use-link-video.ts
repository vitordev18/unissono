import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { Song } from '@/domain/entities/song';
import { songChartQueryKey } from '@/features/cifras/hooks/use-song-chart';
import { useUseCases } from '@/services/container-provider';

export function useLinkVideo(songId: string): UseMutationResult<Song, Error, string> {
  const { linkVideo } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => linkVideo({ songId, videoId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: songChartQueryKey(songId) });
    },
  });
}

export function useUnlinkVideo(songId: string): UseMutationResult<Song, Error, void> {
  const { unlinkVideo } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unlinkVideo(songId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: songChartQueryKey(songId) });
    },
  });
}
