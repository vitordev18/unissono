import { keyUsesFlats, spellWithFlats, spellWithSharps } from './notes';
import type { MusicalKey, PitchClass } from './types';

/**
 * Strategy (princípio Aberto/Fechado): novas regras de grafia entram como
 * implementações desta interface, sem tocar no transpositor.
 */
export interface AccidentalStrategy {
  readonly id: 'pelo-tom' | 'sustenido' | 'bemol';
  spell(pitchClass: PitchClass, targetKey: MusicalKey | null): string;
}

/** Padrão: segue a armadura do tom de destino (Fá maior escreve Bb, não A#). */
export const keySignatureAccidentals: AccidentalStrategy = {
  id: 'pelo-tom',
  spell(pitchClass, targetKey) {
    if (targetKey && keyUsesFlats(targetKey)) {
      return spellWithFlats(pitchClass);
    }

    return spellWithSharps(pitchClass);
  },
};

export const preferSharps: AccidentalStrategy = {
  id: 'sustenido',
  spell: (pitchClass) => spellWithSharps(pitchClass),
};

export const preferFlats: AccidentalStrategy = {
  id: 'bemol',
  spell: (pitchClass) => spellWithFlats(pitchClass),
};

export const accidentalStrategies: Record<AccidentalStrategy['id'], AccidentalStrategy> = {
  'pelo-tom': keySignatureAccidentals,
  sustenido: preferSharps,
  bemol: preferFlats,
};
