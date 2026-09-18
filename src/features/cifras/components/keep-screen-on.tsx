import { useKeepAwake } from 'expo-keep-awake';

const MARCADOR = 'rolagem-da-cifra';

/**
 * Mantém a tela acesa enquanto estiver montado. Renderizado só durante a
 * rolagem automática: parar a rolagem desmonta o componente e devolve ao
 * sistema o controle do bloqueio de tela — não gastamos bateria à toa.
 */
export function KeepScreenOn() {
  useKeepAwake(MARCADOR);

  return null;
}
