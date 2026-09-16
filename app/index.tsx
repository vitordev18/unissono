import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white dark:bg-neutral-950">
      <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Uníssono</Text>
      <Text className="text-base text-neutral-600 dark:text-neutral-400">Ministério de louvor</Text>
    </View>
  );
}
