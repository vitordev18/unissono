import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { VideoSearchResult } from '@/domain/entities/video';
import { useUseCases } from '@/services/container-provider';

/**
 * Busca sob demanda, não a cada tecla: cada consulta custa 100 das 10.000
 * unidades diárias de cota (risco R3 do plano de produto).
 */
export function useVideoSearch(): UseMutationResult<VideoSearchResult[], Error, string> {
  const { searchVideos } = useUseCases();

  return useMutation({
    mutationFn: (termo: string) => searchVideos(termo),
  });
}
