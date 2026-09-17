import { Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { roleLabel } from '@/domain/entities/profile';
import { useCurrentMember } from '@/features/auth/hooks/use-current-member';

export function HomeScreen() {
  const { data: member } = useCurrentMember();
  const profile = member?.profile;

  return (
    <Screen>
      <View className="gap-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Olá, {profile?.name ?? ''}
          </Text>
          <Text className="text-base text-neutral-600 dark:text-neutral-400">
            {profile ? roleLabel(profile.role) : ''}
            {profile?.instrument === null || profile?.instrument === undefined
              ? ''
              : ` · ${profile.instrument}`}
          </Text>
        </View>

        <View className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <Text className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Próxima escala
          </Text>
          <Text className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            As escalas chegam na Fase 7.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
