import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { AuthError } from '@/domain/entities/errors';
import { useCurrentMember } from '@/features/auth/hooks/use-current-member';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

/**
 * Redireciona conforme a sessão. É conveniência de navegação, não segurança:
 * a barreira real é a RLS no Postgres (docs/architecture.md §9).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { data: member, isPending, error } = useCurrentMember();
  const signOut = useSignOut();

  const contaInativa = error instanceof AuthError && error.code === 'conta-inativa';
  const naAreaDeLogin = segments[0] === '(auth)';

  useEffect(() => {
    if (isPending || contaInativa) {
      return;
    }

    if (!member && !naAreaDeLogin) {
      router.replace('/login');
      return;
    }

    if (member && naAreaDeLogin) {
      router.replace('/');
    }
  }, [member, isPending, contaInativa, naAreaDeLogin, router]);

  if (isPending) {
    return (
      <Screen centralizado>
        <ActivityIndicator accessibilityLabel="Carregando" size="large" />
      </Screen>
    );
  }

  if (contaInativa) {
    return (
      <Screen centralizado>
        <View className="gap-4">
          <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Acesso desativado
          </Text>
          <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
            Seu acesso ao ministério está desativado. Fale com a liderança.
          </Text>
          <Button
            label="Sair"
            onPress={() => {
              signOut.mutate();
            }}
          />
        </View>
      </Screen>
    );
  }

  return <>{children}</>;
}
