import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { canAccess } from '@/domain/use-cases/authorize';
import { useCurrentMember } from '@/features/auth/hooks/use-current-member';

/** Guarda de rota por papel. Quem decide é o domínio (canAccess), não a tela. */
export function RequireLeader({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: member } = useCurrentMember();

  if (canAccess('lideranca', member?.profile ?? null)) {
    return <>{children}</>;
  }

  return (
    <Screen centralizado>
      <View className="gap-4">
        <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Área da liderança
        </Text>
        <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
          Você não tem permissão para acessar esta área.
        </Text>
        <Button
          label="Voltar"
          variante="secundario"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}
