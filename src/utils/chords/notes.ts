import type { MusicalKey, PitchClass } from './types';

const COM_SUSTENIDO = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const COM_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const NATURAIS: Record<string, PitchClass> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export const TOTAL_DE_SEMITONS = 12;

export function normalizeSemitones(valor: number): PitchClass {
  return ((valor % TOTAL_DE_SEMITONS) + TOTAL_DE_SEMITONS) % TOTAL_DE_SEMITONS;
}

/** Converte "C", "F#", "Bb", "Cb", "B#" em classe de altura. */
export function parseNoteName(nome: string): PitchClass | null {
  const casamento = /^([A-G])(#{1,2}|b{1,2})?$/.exec(nome);

  if (!casamento) {
    return null;
  }

  const natural = NATURAIS[casamento[1] as string];

  if (natural === undefined) {
    return null;
  }

  const acidentes = casamento[2] ?? '';
  const ajuste = acidentes.startsWith('#') ? acidentes.length : -acidentes.length;

  return normalizeSemitones(natural + ajuste);
}

export function spellWithSharps(pitchClass: PitchClass): string {
  return COM_SUSTENIDO[normalizeSemitones(pitchClass)] as string;
}

export function spellWithFlats(pitchClass: PitchClass): string {
  return COM_BEMOL[normalizeSemitones(pitchClass)] as string;
}

/** Aceita "G", "Bb", "F#m", "Am". */
export function parseKey(texto: string): MusicalKey | null {
  const limpo = texto.trim();
  const minor = /m$/.test(limpo) && !/maj$/i.test(limpo);
  const nome = minor ? limpo.slice(0, -1) : limpo;
  const root = parseNoteName(nome);

  if (root === null) {
    return null;
  }

  return { root, minor };
}

/**
 * Tons que a partitura escreve com bemol. Vem da armadura de clave: em Fá maior
 * o quarto grau é Si bemol, nunca Lá sustenido. Escrever o tom "errado" é
 * legível, mas atrapalha quem lê cifra e pensa em campo harmônico.
 */
const TONS_COM_BEMOL_MAIOR: PitchClass[] = [5, 10, 3, 8, 1, 6];
const TONS_COM_BEMOL_MENOR: PitchClass[] = [2, 7, 0, 5, 10, 3];

export function keyUsesFlats(key: MusicalKey): boolean {
  const tabela = key.minor ? TONS_COM_BEMOL_MENOR : TONS_COM_BEMOL_MAIOR;

  return tabela.includes(normalizeSemitones(key.root));
}

export function formatKey(key: MusicalKey): string {
  const nome = keyUsesFlats(key) ? spellWithFlats(key.root) : spellWithSharps(key.root);

  return key.minor ? `${nome}m` : nome;
}

export function semitonesBetween(origem: MusicalKey, destino: MusicalKey): number {
  return normalizeSemitones(destino.root - origem.root);
}
