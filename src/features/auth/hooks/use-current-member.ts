import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { Member } from '@/domain/use-cases/get-current-member';
import { useContainer } from '@/services/container-provider';
import { queryKeys } from '@/services/query-client';

/**
 * Sessão + perfil do membro autenticado.
 *
 * O Observer do repositório de auth (login, logout, refresh de token) apenas
 * invalida a query: quem manda continua sendo a leitura sob RLS.
 */
export function useCurrentMember(): UseQueryResult<Member | null> {
  const { repositories, useCases } = useContainer();
  const queryClient = useQueryClient();

  useEffect(() => {
    return repositories.auth.onSessionChange(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.currentMember });
    });
  }, [repositories.auth, queryClient]);

  return useQuery({
    queryKey: queryKeys.currentMember,
    queryFn: () => useCases.getCurrentMember(),
    staleTime: Infinity,
    retry: false,
  });
}
