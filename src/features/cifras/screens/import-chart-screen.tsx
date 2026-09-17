import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { previewChart } from '@/domain/use-cases/import-chart';
import { ChartView } from '@/features/cifras/components/chart-view';
import { useImportChart } from '@/features/cifras/hooks/use-import-chart';
import { useSongChart } from '@/features/cifras/hooks/use-song-chart';
import { useReaderPrefs } from '@/store/reader-prefs';
import { chartParsers, formatKey } from '@/utils/chords';
import type { ChartFormat } from '@/utils/chords';

interface ImportChartScreenProps {
  /**
   * "editar" abre com a versão atual carregada; salvar cria uma versão nova,
   * sem sobrescrever a anterior (US-26).
   */
  modo?: 'importar' | 'editar';
}

export function ImportChartScreen({ modo = 'importar' }: ImportChartScreenProps) {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [textoEditado, setTextoEditado] = useState<string | null>(null);
  const [formatoEscolhido, setFormatoEscolhido] = useState<ChartFormat | null>(null);
  const [mostrandoPreVisualizacao, setMostrandoPreVisualizacao] = useState(false);
  const { fontSize, accidental } = useReaderPrefs();
  const importar = useImportChart(id);
  const { data: cifraAtual } = useSongChart(id);

  /**
   * No modo editar o campo começa com a versão atual, sem efeito colateral:
   * enquanto o músico não digita nada, o texto vem direto da consulta.
   */
  const textoDaVersaoAtual = modo === 'editar' ? (cifraAtual?.chart?.contentChordPro ?? '') : '';
  const texto = textoEditado ?? textoDaVersaoAtual;
  const formato = formatoEscolhido ?? (modo === 'editar' ? 'chordpro' : null);

  const preview = useMemo(
    () => (texto.trim().length === 0 ? null : previewChart(texto, formato ?? undefined)),
    [texto, formato],
  );

  const formatoDetectado = preview?.format ?? null;

  if (mostrandoPreVisualizacao && preview !== null) {
    return (
      <Screen>
        <View className="flex-1 gap-3">
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Pré-visualização
          </Text>

          {preview.document.key === null ? null : (
            <Text className="text-base text-neutral-600 dark:text-neutral-400">
              Tom identificado: {formatKey(preview.document.key)}
            </Text>
          )}

          {preview.avisos.map((aviso) => (
            <Text
              key={aviso}
              accessibilityRole="alert"
              className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            >
              {aviso}
            </Text>
          ))}

          {importar.isError ? (
            <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">
              {importar.error.message}
            </Text>
          ) : null}

          <ScrollView contentContainerClassName="pb-4">
            <ChartView
              document={preview.document}
              fontSize={fontSize}
              showChords
              accidental={accidental}
            />
          </ScrollView>

          <View className="gap-2">
            <Button
              label={modo === 'editar' ? 'Salvar nova versão' : 'Salvar cifra'}
              carregando={importar.isPending}
              onPress={() => {
                importar.mutate(
                  {
                    songId: id,
                    raw: texto,
                    ...(formato === null ? {} : { format: formato }),
                  },
                  {
                    onSuccess: () => {
                      router.replace(`/musicas/${id}/cifra`);
                    },
                  },
                );
              }}
            />
            <Button
              label="Voltar e editar"
              variante="secundario"
              onPress={() => {
                setMostrandoPreVisualizacao(false);
              }}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 gap-4">
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
          {modo === 'editar' ? 'Editar cifra' : 'Importar cifra'}
        </Text>

        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {modo === 'editar'
            ? `Ao salvar, esta edição vira a versão ${((cifraAtual?.chart?.version ?? 0) + 1).toString()}. A versão anterior continua guardada.`
            : 'Cole a cifra do ministério em ChordPro ou no formato de acordes sobre a letra. Importe apenas conteúdo que a igreja tem direito de usar.'}
        </Text>

        <View className="flex-row gap-2">
          {chartParsers.map((parser) => {
            const ativo = (formato ?? formatoDetectado) === parser.format;

            return (
              <Pressable
                key={parser.format}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={parser.label}
                onPress={() => {
                  setFormatoEscolhido(parser.format);
                }}
                className={`rounded-lg border px-3 py-2 ${
                  ativo
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                <Text className="text-sm text-neutral-900 dark:text-neutral-50">
                  {parser.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          accessibilityLabel="Cifra"
          multiline
          textAlignVertical="top"
          placeholder={'G          D\nPrimeira linha da letra'}
          placeholderTextColor="#9ca3af"
          value={texto}
          onChangeText={setTextoEditado}
          className="min-h-[220px] flex-1 rounded-xl border border-neutral-300 p-3 font-mono text-sm text-neutral-900 dark:border-neutral-700 dark:text-neutral-50"
        />

        <Button
          label="Continuar"
          disabled={texto.trim().length === 0}
          onPress={() => {
            setMostrandoPreVisualizacao(true);
          }}
        />
      </View>
    </Screen>
  );
}
