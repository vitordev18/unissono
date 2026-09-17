import { parseChord, parseKey } from '@/utils/chords';
import type { Chord, MusicalKey } from '@/utils/chords';

/**
 * Ajudantes de teste que falham alto em vez de usar asserção de não-nulo.
 * Se o parser devolver null aqui, o erro aponta o token que quebrou.
 */
export function lerAcorde(token: string): Chord {
  const acorde = parseChord(token);

  if (acorde === null) {
    throw new Error(`Token não reconhecido como acorde no teste: "${token}"`);
  }

  return acorde;
}

export function lerTom(nome: string): MusicalKey {
  const tom = parseKey(nome);

  if (tom === null) {
    throw new Error(`Tom não reconhecido no teste: "${nome}"`);
  }

  return tom;
}

export function exigirTom(tom: MusicalKey | null | undefined): MusicalKey {
  if (tom === null || tom === undefined) {
    throw new Error('A cifra deveria ter tom definido neste ponto do teste.');
  }

  return tom;
}

export function exigirAcorde(acorde: Chord | null | undefined): Chord {
  if (acorde === null || acorde === undefined) {
    throw new Error('O segmento deveria ter acorde neste ponto do teste.');
  }

  return acorde;
}
