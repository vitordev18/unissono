import { Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { RequireLeader } from '@/features/auth/components/require-leader';

export default function MembrosRoute() {
  return (
    <RequireLeader>
      <Screen>
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Membros do ministério
          </Text>
          <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
            A gestão de membros e convites chega junto com a Edge Function de convite.
          </Text>
        </View>
      </Screen>
    </RequireLeader>
  );
}
