import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import type { Song } from '@/domain/entities/song';
import { useSongSearch } from '@/features/cifras/hooks/use-song-search';
import { useDebounce } from '@/hooks/use-debounce';

function LinhaDaMusica({ song, onPress }: { song: Song; onPress: () => void }) {
  const detalhes = [
    song.artist,
    song.defaultKey,
    song.bpm === null ? null : `${song.bpm.toString()} bpm`,
  ]
    .filter((parte): parte is string => parte !== null && parte.length > 0)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="border-b border-neutral-200 py-3 active:bg-neutral-100 dark:border-neutral-800 dark:active:bg-neutral-900"
    >
      <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">
        {song.title}
      </Text>
      {detalhes.length > 0 ? (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">{detalhes}</Text>
      ) : null}
      {song.tags.length > 0 ? (
        <Text className="text-sm text-neutral-500 dark:text-neutral-500">
          {song.tags.map((tag) => `#${tag}`).join(' ')}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function SongSearchScreen() {
  const router = useRouter();
  const [termo, setTermo] = useState('');
  const termoAdiado = useDebounce(termo, 300);
  const { data: musicas, isPending, isError, error } = useSongSearch(termoAdiado);

  return (
    <Screen>
      <View className="flex-1 gap-4">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Músicas</Text>

        <TextInput
          accessibilityLabel="Buscar música"
          placeholder="Buscar título ou artista"
          placeholderTextColor="#9ca3af"
          value={termo}
          onChangeText={setTermo}
          autoCorrect={false}
          className="min-h-[48px] rounded-xl border border-neutral-300 px-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
        />

        {isPending ? <ActivityIndicator accessibilityLabel="Carregando" /> : null}

        {isError ? (
          <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">
            {error.message}
          </Text>
        ) : null}

        <FlatList
          data={musicas ?? []}
          keyExtractor={(song) => song.id}
          renderItem={({ item }) => (
            <LinhaDaMusica
              song={item}
              onPress={() => {
                router.push(`/musicas/${item.id}`);
              }}
            />
          )}
          ListEmptyComponent={
            isPending ? null : (
              <Text className="py-6 text-center text-base text-neutral-500 dark:text-neutral-500">
                {termoAdiado.length > 0
                  ? 'Nenhuma música encontrada.'
                  : 'O repertório ainda está vazio.'}
              </Text>
            )
          }
        />
      </View>
    </Screen>
  );
}
