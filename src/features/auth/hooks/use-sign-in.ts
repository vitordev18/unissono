import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { AuthSession } from '@/domain/entities/auth';
import { useUseCases } from '@/services/container-provider';
import { queryKeys } from '@/services/query-client';

export interface LoginInput {
  email: string;
  password: string;
}

export function useSignIn(): UseMutationResult<AuthSession, Error, LoginInput> {
  const { signIn } = useUseCases();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => signIn(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentMember });
    },
  });
}
