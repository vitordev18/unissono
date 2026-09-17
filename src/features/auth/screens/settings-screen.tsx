import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { roleLabel } from '@/domain/entities/profile';
import { canAccess } from '@/domain/use-cases/authorize';
import { useCurrentMember } from '@/features/auth/hooks/use-current-member';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';

export function SettingsScreen() {
  const router = useRouter();
  const { data: member } = useCurrentMember();
  const signOut = useSignOut();
  const profile = member?.profile ?? null;

  return (
    <Screen>
      <View className="flex-1 justify-between">
        <View className="gap-6">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Ajustes</Text>

          <View className="gap-1 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {profile?.name ?? ''}
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              {member?.session.email ?? ''}
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              {profile ? roleLabel(profile.role) : ''}
            </Text>
          </View>

          {canAccess('lideranca', profile) ? (
            <Button
              label="Membros do ministério"
              variante="secundario"
              onPress={() => {
                router.push('/membros');
              }}
            />
          ) : null}
        </View>

        <Button
          label="Sair"
          carregando={signOut.isPending}
          onPress={() => {
            signOut.mutate();
          }}
        />
      </View>
    </Screen>
  );
}
