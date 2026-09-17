import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  centralizado = false,
}: {
  children: ReactNode;
  centralizado?: boolean;
}) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className={`flex-1 px-5 py-4 ${centralizado ? 'justify-center' : ''}`}>{children}</View>
    </SafeAreaView>
  );
}
