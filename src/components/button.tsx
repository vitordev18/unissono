import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variante = 'primario' | 'secundario';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variante?: Variante;
  carregando?: boolean;
}

const estilos: Record<Variante, { container: string; texto: string }> = {
  primario: {
    container: 'bg-indigo-600 active:bg-indigo-700',
    texto: 'text-white',
  },
  secundario: {
    container: 'bg-transparent active:bg-neutral-100 dark:active:bg-neutral-800',
    texto: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function Button({
  label,
  variante = 'primario',
  carregando = false,
  ...props
}: ButtonProps) {
  const desabilitado = props.disabled === true || carregando;
  const estilo = estilos[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado, busy: carregando }}
      disabled={desabilitado}
      className={`min-h-[48px] items-center justify-center rounded-xl px-4 py-3 ${estilo.container} ${
        desabilitado ? 'opacity-60' : ''
      }`}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'primario' ? '#ffffff' : '#4f46e5'} />
      ) : (
        <Text className={`text-base font-semibold ${estilo.texto}`}>{label}</Text>
      )}
    </Pressable>
  );
}
