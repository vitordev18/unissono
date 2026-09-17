import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { AutoScrollBar } from '@/features/cifras/components/autoscroll-bar';
import { ChartView } from '@/features/cifras/components/chart-view';
import { ReaderToolbar } from '@/features/cifras/components/reader-toolbar';
import { useAutoScroll } from '@/features/cifras/hooks/use-auto-scroll';
import { useSongChart } from '@/features/cifras/hooks/use-song-chart';
import { useReaderPrefs } from '@/store/reader-prefs';
import { estimateDurationSeconds } from '@/utils/auto-scroll';
import {
  formatKey,
  normalizeSemitones,
  parseKey,
  semitonesBetween,
  transposeChart,
} from '@/utils/chords';

export function ChartViewerScreen() {
  const router = useRouter();
  const { id, tom } = useLocalSearchParams<{ id: string; tom?: string }>();
  const { data, isPending, isError, error } = useSongChart(id);
  const { fontSize, showChords, accidental } = useReaderPrefs();
  const [ajuste, setAjuste] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [alturaDoConteudo, setAlturaDoConteudo] = useState(0);
  const [alturaVisivel, setAlturaVisivel] = useState(0);

  const documentoOriginal = data?.document ?? null;

  /**
   * Quando a escala define o tom do culto (?tom=A), a cifra abre já transposta.
   * O ajuste manual do músico, se houver, prevalece sobre esse padrão.
   */
  const semitons = useMemo(() => {
    if (ajuste !== null) {
      return ajuste;
    }

    const tomDoCulto = tom === undefined ? null : parseKey(tom);

    if (tomDoCulto === null || documentoOriginal?.key == null) {
      return 0;
    }

    return semitonesBetween(documentoOriginal.key, tomDoCulto);
  }, [ajuste, tom, documentoOriginal]);

  const documento = useMemo(
    () =>
      documentoOriginal === null
        ? null
        : transposeChart(documentoOriginal, { semitones: semitons }),
    [documentoOriginal, semitons],
  );

  const totalDeLinhas = useMemo(
    () =>
      (documentoOriginal?.sections ?? []).reduce(
        (total, section) => total + section.lines.length,
        0,
      ),
    [documentoOriginal],
  );

  // Sem vídeo vinculado (Fase 6), a duração vem do andamento da música.
  const duracaoEstimada = estimateDurationSeconds({
    bpm: data?.song.bpm ?? null,
    lineCount: totalDeLinhas,
  });

  const aplicarRolagem = useCallback((offset: number) => {
    scrollRef.current?.scrollTo({ y: offset, animated: false });
  }, []);

  const autoScroll = useAutoScroll({
    contentHeight: alturaDoConteudo,
    viewportHeight: alturaVisivel,
    durationSeconds: duracaoEstimada,
    onScroll: aplicarRolagem,
  });

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

  if (documento === null) {
    return (
      <Screen centralizado>
        <View className="gap-4">
          <Text className="text-center text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {data.song.title}
          </Text>
          <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
            Esta música ainda não tem cifra.
          </Text>
          <Button
            label="Importar cifra"
            variante="secundario"
            onPress={() => {
              router.push(`/musicas/${id}/importar`);
            }}
          />
        </View>
      </Screen>
    );
  }

  const tomAtual = documento.key === null ? '—' : formatKey(documento.key);

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <View>
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            {data.song.title}
          </Text>
          {data.song.artist === null ? null : (
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              {data.song.artist}
            </Text>
          )}
        </View>

        <ReaderToolbar
          tomAtual={tomAtual}
          podeVoltarAoOriginal={normalizeSemitones(semitons) !== 0}
          onTransposeUp={() => {
            setAjuste(semitons + 1);
          }}
          onTransposeDown={() => {
            setAjuste(semitons - 1);
          }}
          onReset={() => {
            setAjuste(0);
          }}
        />

        <ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          contentContainerClassName="pb-8"
          onLayout={(evento: LayoutChangeEvent) => {
            setAlturaVisivel(evento.nativeEvent.layout.height);
          }}
          onContentSizeChange={(_largura, altura) => {
            setAlturaDoConteudo(altura);
          }}
          onScrollBeginDrag={() => {
            // Encostou o dedo na cifra: a rolagem automática sai do caminho.
            autoScroll.pause();
          }}
          onScroll={(evento: NativeSyntheticEvent<NativeScrollEvent>) => {
            autoScroll.sincronizarOffset(evento.nativeEvent.contentOffset.y);
          }}
        >
          <ChartView
            document={documento}
            fontSize={fontSize}
            showChords={showChords}
            accidental={accidental}
          />
        </ScrollView>

        <AutoScrollBar
          rolando={autoScroll.rolando}
          multiplicador={autoScroll.multiplicador}
          progresso={autoScroll.progresso}
          onToggle={autoScroll.toggle}
          onAcelerar={autoScroll.acelerar}
          onDesacelerar={autoScroll.desacelerar}
          onReiniciar={autoScroll.reiniciar}
        />
      </View>
    </Screen>
  );
}
