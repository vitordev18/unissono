/**
 * Cálculo da rolagem automática (DP-07).
 *
 * A velocidade não sai do BPM sozinho: BPM diz o andamento, não quanto tempo a
 * música dura nem quanto texto existe na tela. O que a rolagem precisa é de uma
 * duração — de preferência a do vídeo vinculado (Fase 6); na falta dela,
 * estimada a partir do BPM e da quantidade de linhas da cifra.
 *
 * Tudo aqui é função pura: o hook só amarra isso ao relógio da tela.
 */

export const MULTIPLICADOR_MINIMO = 0.25;
export const MULTIPLICADOR_MAXIMO = 3;
export const COMPASSOS_POR_LINHA = 1;
export const BATIDAS_POR_COMPASSO = 4;

/** Velocidade usada quando não há BPM nem duração: leitura confortável. */
export const VELOCIDADE_PADRAO_PX_POR_SEGUNDO = 20;

export interface DurationInput {
  bpm: number | null;
  lineCount: number;
  beatsPerMeasure?: number;
  measuresPerLine?: number;
}

/**
 * Estimativa de duração em segundos a partir do andamento.
 * Uma linha de cifra ≈ um compasso — heurística assumida e ajustável pelo
 * músico com o controle de velocidade.
 */
export function estimateDurationSeconds({
  bpm,
  lineCount,
  beatsPerMeasure = BATIDAS_POR_COMPASSO,
  measuresPerLine = COMPASSOS_POR_LINHA,
}: DurationInput): number | null {
  if (bpm === null || bpm <= 0 || lineCount <= 0) {
    return null;
  }

  const batidas = lineCount * measuresPerLine * beatsPerMeasure;

  return (batidas * 60) / bpm;
}

export interface SpeedInput {
  contentHeight: number;
  viewportHeight: number;
  durationSeconds: number | null;
  multiplier?: number;
}

/** Velocidade em pixels por segundo. Zero quando não há o que rolar. */
export function calculateScrollSpeed({
  contentHeight,
  viewportHeight,
  durationSeconds,
  multiplier = 1,
}: SpeedInput): number {
  const distancia = contentHeight - viewportHeight;

  if (distancia <= 0) {
    return 0;
  }

  const fator = clampMultiplier(multiplier);

  if (durationSeconds === null || durationSeconds <= 0) {
    return VELOCIDADE_PADRAO_PX_POR_SEGUNDO * fator;
  }

  return (distancia / durationSeconds) * fator;
}

export function clampMultiplier(multiplier: number): number {
  return Math.min(MULTIPLICADOR_MAXIMO, Math.max(MULTIPLICADOR_MINIMO, multiplier));
}

/** Próxima posição do scroll; nunca passa do fim do conteúdo. */
export function nextOffset({
  offset,
  speed,
  elapsedMs,
  maxOffset,
}: {
  offset: number;
  speed: number;
  elapsedMs: number;
  maxOffset: number;
}): number {
  const avanco = (speed * elapsedMs) / 1000;

  return Math.min(maxOffset, Math.max(0, offset + avanco));
}

export function hasReachedEnd(offset: number, maxOffset: number): boolean {
  return maxOffset <= 0 || offset >= maxOffset - 0.5;
}

export function formatMultiplier(multiplier: number): string {
  return `${clampMultiplier(multiplier)
    .toFixed(2)
    .replace(/\.?0+$/, '')
    .replace('.', ',')}×`;
}
