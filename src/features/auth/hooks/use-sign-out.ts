import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { useUseCases } from '@/services/container-provider';

export function useSignOut(): UseMutationResult<void, Error, void> {
  const { signOut } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      // Sair do app não pode deixar dados do ministério no cache (OWASP M9).
      queryClient.clear();
    },
  });
}
