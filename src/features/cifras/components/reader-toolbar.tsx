import { Pressable, Text, View } from 'react-native';

import { useReaderPrefs, TAMANHO_MAXIMO, TAMANHO_MINIMO } from '@/store/reader-prefs';
import type { AccidentalStrategy } from '@/utils/chords';

const PROXIMA_ESTRATEGIA: Record<AccidentalStrategy['id'], AccidentalStrategy['id']> = {
  'pelo-tom': 'sustenido',
  sustenido: 'bemol',
  bemol: 'pelo-tom',
};

const ROTULO_DA_ESTRATEGIA: Record<AccidentalStrategy['id'], string> = {
  'pelo-tom': 'Pelo tom',
  sustenido: '♯',
  bemol: '♭',
};

function BotaoDaBarra({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-neutral-300 px-3 dark:border-neutral-700 ${
        disabled ? 'opacity-40' : 'active:bg-neutral-100 dark:active:bg-neutral-800'
      }`}
    >
      <Text className="text-base font-medium text-neutral-900 dark:text-neutral-50">{label}</Text>
    </Pressable>
  );
}

export function ReaderToolbar({
  tomAtual,
  onTransposeUp,
  onTransposeDown,
  onReset,
  podeVoltarAoOriginal,
}: {
  tomAtual: string;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onReset: () => void;
  podeVoltarAoOriginal: boolean;
}) {
  const {
    fontSize,
    showChords,
    accidental,
    increaseFont,
    decreaseFont,
    toggleChords,
    setAccidental,
  } = useReaderPrefs();

  return (
    <View className="gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
      <View className="flex-row items-center gap-2">
        <BotaoDaBarra label="−" accessibilityLabel="Descer meio tom" onPress={onTransposeDown} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar ao tom original"
          disabled={!podeVoltarAoOriginal}
          onPress={onReset}
          className="min-h-[40px] min-w-[64px] items-center justify-center rounded-lg bg-indigo-50 px-3 dark:bg-indigo-950"
        >
          <Text className="text-base font-bold text-indigo-700 dark:text-indigo-300">
            {tomAtual}
          </Text>
        </Pressable>
        <BotaoDaBarra label="+" accessibilityLabel="Subir meio tom" onPress={onTransposeUp} />

        <View className="flex-1" />

        <BotaoDaBarra
          label={ROTULO_DA_ESTRATEGIA[accidental]}
          accessibilityLabel="Alternar grafia de acidentes"
          onPress={() => {
            setAccidental(PROXIMA_ESTRATEGIA[accidental]);
          }}
        />
      </View>

      <View className="flex-row items-center gap-2">
        <BotaoDaBarra
          label="A−"
          accessibilityLabel="Diminuir a fonte"
          onPress={decreaseFont}
          disabled={fontSize <= TAMANHO_MINIMO}
        />
        <BotaoDaBarra
          label="A+"
          accessibilityLabel="Aumentar a fonte"
          onPress={increaseFont}
          disabled={fontSize >= TAMANHO_MAXIMO}
        />
        <BotaoDaBarra
          label={showChords ? 'Só letra' : 'Com acordes'}
          accessibilityLabel={showChords ? 'Ocultar acordes' : 'Mostrar acordes'}
          onPress={toggleChords}
        />
      </View>
    </View>
  );
}
