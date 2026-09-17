import { memo } from 'react';
import { Platform, Text, View } from 'react-native';

import { accidentalStrategies, formatChord } from '@/utils/chords';
import type { ChartDocument, Line, MusicalKey, Section } from '@/utils/chords';

const FONTE_MONOESPACADA = Platform.select({ ios: 'Menlo', android: 'monospace' }) ?? 'monospace';

const ROTULO_PADRAO: Record<Section['type'], string> = {
  intro: 'Intro',
  verse: 'Verso',
  chorus: 'Refrão',
  bridge: 'Ponte',
  ending: 'Final',
  other: '',
};

interface ChartViewProps {
  document: ChartDocument;
  fontSize: number;
  showChords: boolean;
  accidental: keyof typeof accidentalStrategies;
}

interface LinhaProps {
  line: Line;
  tom: MusicalKey | null;
  fontSize: number;
  showChords: boolean;
  accidental: keyof typeof accidentalStrategies;
}

/**
 * Cada trecho é uma coluna: acorde em cima, letra embaixo. É o que mantém o
 * acorde na sílaba certa em qualquer largura de tela — sem depender de
 * espaçamento em fonte monoespaçada para a letra inteira.
 */
const LinhaDaCifra = memo(function LinhaDaCifra({
  line,
  tom,
  fontSize,
  showChords,
  accidental,
}: LinhaProps) {
  const estrategia = accidentalStrategies[accidental];

  return (
    <View className="flex-row flex-wrap">
      {line.segments.map((segment, indice) => (
        <View key={indice} className="flex-col">
          {showChords ? (
            <Text
              style={{ fontFamily: FONTE_MONOESPACADA, fontSize: fontSize - 2 }}
              className="font-bold text-indigo-600 dark:text-indigo-400"
            >
              {segment.chord === null ? ' ' : formatChord(segment.chord, estrategia, tom)}
            </Text>
          ) : null}
          <Text style={{ fontSize }} className="text-neutral-900 dark:text-neutral-100">
            {segment.lyric.length === 0 ? ' ' : segment.lyric}
          </Text>
        </View>
      ))}
    </View>
  );
});

export const ChartView = memo(function ChartView({
  document,
  fontSize,
  showChords,
  accidental,
}: ChartViewProps) {
  return (
    <View className="gap-5">
      {document.sections.map((section, indiceDaSecao) => {
        const rotulo = section.label ?? ROTULO_PADRAO[section.type];

        return (
          <View key={indiceDaSecao} className="gap-1">
            {rotulo.length > 0 ? (
              <Text className="text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                {rotulo}
              </Text>
            ) : null}
            {section.lines.map((line, indiceDaLinha) => (
              <LinhaDaCifra
                key={indiceDaLinha}
                line={line}
                tom={document.key}
                fontSize={fontSize}
                showChords={showChords}
                accidental={accidental}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
});
