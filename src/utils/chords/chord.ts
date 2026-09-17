import { normalizeSemitones, parseNoteName, spellWithSharps } from './notes';
import type { AccidentalStrategy } from './accidentals';
import type { Chord, MusicalKey } from './types';

/**
 * Sufixos aceitos. A lista é permissiva de propósito: a cifra da igreja mistura
 * notação brasileira (C7M, C4, Cº) com a americana (Cmaj7, Csus4, Cdim), e o
 * transpositor não precisa entender o sufixo — só preservá-lo.
 */
const SUFIXO_VALIDO = /^[a-zA-Z0-9º°ºΔ+\-#b()/,°*]*$/;
const PADRAO_DE_ACORDE = /^([A-G](?:#{1,2}|b{1,2})?)([^/\s]*)(?:\/([A-G](?:#{1,2}|b{1,2})?))?$/;

export function parseChord(token: string): Chord | null {
  const limpo = token.trim();

  if (limpo.length === 0) {
    return null;
  }

  const casamento = PADRAO_DE_ACORDE.exec(limpo);

  if (!casamento) {
    return null;
  }

  const root = parseNoteName(casamento[1] as string);
  const suffix = casamento[2] ?? '';
  const nomeDoBaixo = casamento[3];

  if (root === null || !SUFIXO_VALIDO.test(suffix)) {
    return null;
  }

  const bass = nomeDoBaixo === undefined ? null : parseNoteName(nomeDoBaixo);

  if (nomeDoBaixo !== undefined && bass === null) {
    return null;
  }

  return { root, suffix, bass };
}

export function formatChord(
  chord: Chord,
  strategy: AccidentalStrategy,
  targetKey: MusicalKey | null = null,
): string {
  const fundamental = strategy.spell(chord.root, targetKey);
  const baixo = chord.bass === null ? '' : `/${strategy.spell(chord.bass, targetKey)}`;

  return `${fundamental}${chord.suffix}${baixo}`;
}

export function transposeChord(chord: Chord, semitones: number): Chord {
  return {
    root: normalizeSemitones(chord.root + semitones),
    suffix: chord.suffix,
    bass: chord.bass === null ? null : normalizeSemitones(chord.bass + semitones),
  };
}

/** Só para depuração e mensagens de erro: grafia neutra, sempre com sustenido. */
export function debugChord(chord: Chord): string {
  return `${spellWithSharps(chord.root)}${chord.suffix}`;
}
