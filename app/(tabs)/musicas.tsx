import { Text, View } from 'react-native';

import { Screen } from '@/components/screen';

export default function MusicasPlaceholder() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Músicas</Text>
        <Text className="text-base text-neutral-600 dark:text-neutral-400">Chega na Fase 8.</Text>
      </View>
    </Screen>
  );
}
