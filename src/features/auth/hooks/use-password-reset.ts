import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { useUseCases } from '@/services/container-provider';

export function usePasswordReset(): UseMutationResult<void, Error, string> {
  const { requestPasswordReset } = useUseCases();

  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}
