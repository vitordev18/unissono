import { Pressable, Text, View } from 'react-native';

import { formatMultiplier } from '@/utils/auto-scroll';

function Botao({
  label,
  accessibilityLabel,
  onPress,
  destaque = false,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  destaque?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={`min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 ${
        destaque
          ? 'bg-indigo-600 active:bg-indigo-700'
          : 'border border-neutral-300 active:bg-neutral-100 dark:border-neutral-700 dark:active:bg-neutral-800'
      }`}
    >
      <Text
        className={`text-base font-semibold ${
          destaque ? 'text-white' : 'text-neutral-900 dark:text-neutral-50'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AutoScrollBar({
  rolando,
  multiplicador,
  progresso,
  onToggle,
  onAcelerar,
  onDesacelerar,
  onReiniciar,
}: {
  rolando: boolean;
  multiplicador: number;
  progresso: number;
  onToggle: () => void;
  onAcelerar: () => void;
  onDesacelerar: () => void;
  onReiniciar: () => void;
}) {
  return (
    <View className="gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Progresso da rolagem"
        accessibilityValue={{ now: Math.round(progresso * 100), min: 0, max: 100 }}
        className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <View
          className="h-1 rounded-full bg-indigo-600"
          style={{ width: `${Math.round(progresso * 100).toString()}%` as `${number}%` }}
        />
      </View>

      <View className="flex-row items-center gap-2">
        <Botao
          label={rolando ? '❚❚' : '▶'}
          accessibilityLabel={rolando ? 'Pausar rolagem' : 'Iniciar rolagem'}
          onPress={onToggle}
          destaque
        />
        <Botao label="↺" accessibilityLabel="Voltar ao início da cifra" onPress={onReiniciar} />

        <View className="flex-1" />

        <Botao label="−" accessibilityLabel="Diminuir a velocidade" onPress={onDesacelerar} />
        <View className="min-w-[56px] items-center">
          <Text
            accessibilityLabel="Velocidade da rolagem"
            className="text-base font-medium text-neutral-900 dark:text-neutral-50"
          >
            {formatMultiplier(multiplicador)}
          </Text>
        </View>
        <Botao label="+" accessibilityLabel="Aumentar a velocidade" onPress={onAcelerar} />
      </View>
    </View>
  );
}
