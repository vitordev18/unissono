import { formatChord, parseChord, transposeChord } from '@/utils/chords/chord';
import { keySignatureAccidentals, preferFlats, preferSharps } from '@/utils/chords/accidentals';
import { parseKey } from '@/utils/chords/notes';

import { exigirAcorde } from '../../support/chords';

describe('parseChord', () => {
  it('lê a fundamental e preserva o sufixo intacto', () => {
    expect(parseChord('C')).toEqual({ root: 0, suffix: '', bass: null });
    expect(parseChord('Am')).toEqual({ root: 9, suffix: 'm', bass: null });
    expect(parseChord('C7M(9)')).toEqual({ root: 0, suffix: '7M(9)', bass: null });
    expect(parseChord('Gsus4')).toEqual({ root: 7, suffix: 'sus4', bass: null });
    expect(parseChord('F#m7')).toEqual({ root: 6, suffix: 'm7', bass: null });
    expect(parseChord('Bb')).toEqual({ root: 10, suffix: '', bass: null });
  });

  it('entende notação brasileira de cifra', () => {
    expect(parseChord('C4')).toEqual({ root: 0, suffix: '4', bass: null });
    expect(parseChord('Bº')).toEqual({ root: 11, suffix: 'º', bass: null });
    expect(parseChord('E7M')).toEqual({ root: 4, suffix: '7M', bass: null });
  });

  it('separa o baixo invertido', () => {
    expect(parseChord('D/F#')).toEqual({ root: 2, suffix: '', bass: 6 });
    expect(parseChord('Am7/G')).toEqual({ root: 9, suffix: 'm7', bass: 7 });
  });

  it('recusa o que não é acorde', () => {
    expect(parseChord('Hm')).toBeNull();
    expect(parseChord('palavra')).toBeNull();
    expect(parseChord('')).toBeNull();
    expect(parseChord('C/H')).toBeNull();
  });
});

describe('formatChord', () => {
  const dRe = parseChord('D/F#');

  it('grafa conforme a estratégia escolhida', () => {
    const sustenido = parseChord('A#m7');

    expect(sustenido).not.toBeNull();
    expect(formatChord(exigirAcorde(sustenido), preferSharps)).toBe('A#m7');
    expect(formatChord(exigirAcorde(sustenido), preferFlats)).toBe('Bbm7');
  });

  it('segue a armadura do tom de destino por padrão', () => {
    const acorde = parseChord('A#');

    expect(acorde).not.toBeNull();
    // Em Fá maior a quarta é Si bemol — nunca Lá sustenido.
    expect(formatChord(exigirAcorde(acorde), keySignatureAccidentals, parseKey('F'))).toBe('Bb');
    expect(formatChord(exigirAcorde(acorde), keySignatureAccidentals, parseKey('D'))).toBe('A#');
  });

  it('mantém o baixo invertido ao grafar', () => {
    expect(dRe).not.toBeNull();
    expect(formatChord(exigirAcorde(dRe), preferSharps)).toBe('D/F#');
  });
});

describe('transposeChord', () => {
  it('desloca fundamental e baixo juntos', () => {
    const acorde = parseChord('D/F#');

    expect(acorde).not.toBeNull();
    expect(transposeChord(exigirAcorde(acorde), 2)).toEqual({ root: 4, suffix: '', bass: 8 });
  });

  it('dá a volta ao passar de si para dó', () => {
    const acorde = parseChord('B');

    expect(acorde).not.toBeNull();
    expect(transposeChord(exigirAcorde(acorde), 1).root).toBe(0);
  });
});
