import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { formatDuration, type VideoSearchResult } from '@/domain/entities/video';
import { useSongChart } from '@/features/cifras/hooks/use-song-chart';
import { useLinkVideo } from '@/features/youtube/hooks/use-link-video';
import { useVideoSearch } from '@/features/youtube/hooks/use-video-search';

function Resultado({
  video,
  selecionado,
  onPress,
}: {
  video: VideoSearchResult;
  selecionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={video.title}
      onPress={onPress}
      className={`mb-2 flex-row gap-3 rounded-xl border p-2 ${
        selecionado
          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      {video.thumbnailUrl.length > 0 ? (
        <Image
          source={{ uri: video.thumbnailUrl }}
          accessibilityIgnoresInvertColors
          className="h-16 w-28 rounded-lg"
        />
      ) : null}
      <View className="flex-1">
        <Text numberOfLines={2} className="text-base text-neutral-900 dark:text-neutral-50">
          {video.title}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {video.channel}
          {video.durationSeconds > 0 ? ` · ${formatDuration(video.durationSeconds)}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export function VideoSearchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: musica } = useSongChart(id);
  const busca = useVideoSearch();
  const vincular = useLinkVideo(id);

  const sugestao = [musica?.song.title, musica?.song.artist].filter(Boolean).join(' ');
  const [termo, setTermo] = useState<string | null>(null);
  const termoAtual = termo ?? sugestao;
  const [selecionado, setSelecionado] = useState<string | null>(null);

  return (
    <Screen>
      <View className="flex-1 gap-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Vincular vídeo
        </Text>

        <View className="flex-row gap-2">
          <TextInput
            accessibilityLabel="Buscar vídeo"
            placeholder="Título e artista"
            placeholderTextColor="#9ca3af"
            value={termoAtual}
            onChangeText={setTermo}
            onSubmitEditing={() => {
              busca.mutate(termoAtual);
            }}
            returnKeyType="search"
            className="min-h-[48px] flex-1 rounded-xl border border-neutral-300 px-3 text-base text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
          />
          <Button
            label="Buscar"
            carregando={busca.isPending}
            onPress={() => {
              busca.mutate(termoAtual);
            }}
          />
        </View>

        {busca.isError ? (
          <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">
            {busca.error.message}
          </Text>
        ) : null}

        {vincular.isError ? (
          <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">
            {vincular.error.message}
          </Text>
        ) : null}

        {busca.isPending ? <ActivityIndicator accessibilityLabel="Buscando" /> : null}

        <FlatList
          data={busca.data ?? []}
          keyExtractor={(video) => video.videoId}
          renderItem={({ item }) => (
            <Resultado
              video={item}
              selecionado={selecionado === item.videoId}
              onPress={() => {
                setSelecionado(item.videoId);
              }}
            />
          )}
          ListEmptyComponent={
            busca.isPending || busca.isIdle ? null : (
              <Text className="py-6 text-center text-base text-neutral-500 dark:text-neutral-500">
                Nenhum vídeo encontrado.
              </Text>
            )
          }
        />

        <Button
          label="Vincular vídeo selecionado"
          disabled={selecionado === null}
          carregando={vincular.isPending}
          onPress={() => {
            if (selecionado === null) {
              return;
            }

            vincular.mutate(selecionado, {
              onSuccess: () => {
                router.back();
              },
            });
          }}
        />
      </View>
    </Screen>
  );
}
