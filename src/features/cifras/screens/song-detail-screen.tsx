import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { canAccess } from '@/domain/use-cases/authorize';
import { useCurrentMember } from '@/features/auth/hooks/use-current-member';
import { useSongChart } from '@/features/cifras/hooks/use-song-chart';

export function SongDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error } = useSongChart(id);
  const { data: member } = useCurrentMember();
  const ehLider = canAccess('lideranca', member?.profile ?? null);

  if (isPending) {
    return (
      <Screen centralizado>
        <ActivityIndicator accessibilityLabel="Carregando" size="large" />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen centralizado>
        <Text
          accessibilityRole="alert"
          className="text-center text-base text-red-600 dark:text-red-400"
        >
          {error.message}
        </Text>
      </Screen>
    );
  }

  const { song, chart } = data;
  const detalhes = [
    song.artist,
    song.defaultKey,
    song.bpm === null ? null : `${song.bpm.toString()} bpm`,
  ]
    .filter((parte): parte is string => parte !== null && parte.length > 0)
    .join(' · ');

  return (
    <Screen>
      <View className="gap-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {song.title}
          </Text>
          {detalhes.length > 0 ? (
            <Text className="text-base text-neutral-600 dark:text-neutral-400">{detalhes}</Text>
          ) : null}
          {song.tags.length > 0 ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-500">
              {song.tags.map((tag) => `#${tag}`).join(' ')}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Button
            label={chart === null ? 'Sem cifra ainda' : 'Abrir cifra'}
            disabled={chart === null}
            onPress={() => {
              router.push(`/musicas/${id}/cifra`);
            }}
          />

          {ehLider ? (
            <Button
              label={chart === null ? 'Importar cifra' : 'Editar cifra'}
              variante="secundario"
              onPress={() => {
                router.push(chart === null ? `/musicas/${id}/importar` : `/musicas/${id}/editar`);
              }}
            />
          ) : null}
        </View>

        <View className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <Text className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Cifra
          </Text>
          <Text className="mt-1 text-base text-neutral-700 dark:text-neutral-300">
            {chart === null
              ? 'Nenhuma versão salva.'
              : `Versão ${chart.version.toString()} · tom ${chart.key}`}
          </Text>
        </View>

        <View className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <Text className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Vídeo de referência
          </Text>
          <Text className="mt-1 text-base text-neutral-700 dark:text-neutral-300">
            A busca no YouTube chega na Fase 6.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
