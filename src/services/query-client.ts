import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Catálogo muda pouco; escalas têm Realtime para invalidar na hora.
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}

export const queryKeys = {
  currentMember: ['sessao', 'membro-atual'] as const,
};
