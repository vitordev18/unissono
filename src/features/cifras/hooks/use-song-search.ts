import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { Song } from '@/domain/entities/song';
import { useUseCases } from '@/services/container-provider';

export function useSongSearch(term: string): UseQueryResult<Song[]> {
  const { searchSongs } = useUseCases();

  return useQuery({
    queryKey: ['songs', { term }],
    queryFn: () => searchSongs({ term }),
    staleTime: 5 * 60_000,
  });
}
