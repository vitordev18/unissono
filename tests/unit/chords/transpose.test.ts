import { keySignatureAccidentals, preferFlats, preferSharps } from '@/utils/chords/accidentals';
import { formatChord } from '@/utils/chords/chord';
import { formatKey, TOTAL_DE_SEMITONS } from '@/utils/chords/notes';
import { parseChart } from '@/utils/chords/parsers/registry';
import { toChordPro } from '@/utils/chords/serialize';
import { transposeChart, transposeChartToKey } from '@/utils/chords/transpose';
import type { ChartDocument, MusicalKey } from '@/utils/chords/types';

import { exigirAcorde, exigirTom, lerTom } from '../../support/chords';

const CIFRA = `{title: Exemplo}
{key: G}
{start_of_verse}
[G]Primeira linha [D/F#]com baixo
[Em7]Segunda [C9]linha [Am7(11)]aqui
{end_of_verse}`;

const TODOS_OS_TONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

function acordesDe(doc: ChartDocument, tom: MusicalKey | null = doc.key): string[] {
  return doc.sections
    .flatMap((section) => section.lines)
    .flatMap((line) => line.segments)
    .filter((segment) => segment.chord !== null)
    .map((segment) => formatChord(exigirAcorde(segment.chord), keySignatureAccidentals, tom));
}

describe('transposeChart', () => {
  const original = parseChart(CIFRA);

  it('preserva letra, seções e sufixos em todas as 12 tonalidades', () => {
    for (let semitons = 0; semitons < TOTAL_DE_SEMITONS; semitons += 1) {
      const transposto = transposeChart(original, { semitones: semitons });

      expect(transposto.sections).toHaveLength(original.sections.length);
      expect(acordesDe(transposto)).toHaveLength(5);

      const letras = transposto.sections
        .flatMap((section) => section.lines)
        .flatMap((line) => line.segments)
        .map((segment) => segment.lyric);

      expect(letras).toEqual(
        original.sections
          .flatMap((section) => section.lines)
          .flatMap((line) => line.segments)
          .map((segment) => segment.lyric),
      );

      // O sufixo nunca muda ao transpor (a fundamental e o baixo, sim).
      const sufixos = transposto.sections
        .flatMap((section) => section.lines)
        .flatMap((line) => line.segments)
        .filter((segment) => segment.chord !== null)
        .map((segment) => exigirAcorde(segment.chord).suffix);

      expect(sufixos).toEqual(['', '', 'm7', '9', 'm7(11)']);

      // O acorde com baixo invertido continua tendo baixo depois de transposto.
      const comBaixo = transposto.sections
        .flatMap((section) => section.lines)
        .flatMap((line) => line.segments)
        .filter((segment) => segment.chord?.bass !== null && segment.chord !== null);

      expect(comBaixo).toHaveLength(1);
    }
  });

  it('é reversível: +n seguido de −n devolve o original', () => {
    for (let semitons = 1; semitons < TOTAL_DE_SEMITONS; semitons += 1) {
      const ida = transposeChart(original, { semitones: semitons });
      const volta = transposeChart(ida, { semitones: -semitons });

      expect(acordesDe(volta)).toEqual(acordesDe(original));
      expect(formatKey(exigirTom(volta.key))).toBe('G');
    }
  });

  it('doze transposições de um semitom voltam ao ponto de partida', () => {
    let doc = original;

    for (let i = 0; i < TOTAL_DE_SEMITONS; i += 1) {
      doc = transposeChart(doc, { semitones: 1 });
    }

    expect(toChordPro(doc)).toBe(toChordPro(original));
  });
});

describe('transposeChartToKey', () => {
  const original = parseChart(CIFRA);

  it('leva a cifra para qualquer um dos 12 tons', () => {
    for (const nome of TODOS_OS_TONS) {
      const destino = lerTom(nome);
      const transposto = transposeChartToKey(original, destino);

      expect(transposto.key).not.toBeNull();
      expect(exigirTom(transposto.key).root).toBe(destino.root);
    }
  });

  it('usa bemóis nos tons de armadura bemol e sustenidos nos demais', () => {
    const paraFa = transposeChartToKey(original, lerTom('F'));
    const paraRe = transposeChartToKey(original, lerTom('D'));

    expect(formatKey(exigirTom(paraFa.key))).toBe('F');
    expect(acordesDe(paraFa)).toEqual(['F', 'C/E', 'Dm7', 'Bb9', 'Gm7(11)']);

    expect(formatKey(exigirTom(paraRe.key))).toBe('D');
    expect(acordesDe(paraRe)).toEqual(['D', 'A/C#', 'Bm7', 'G9', 'Em7(11)']);
  });

  it('respeita a estratégia escolhida pelo músico', () => {
    const transposto = transposeChart(original, { semitones: 3 });
    const acorde = transposto.sections[0]?.lines[0]?.segments[0]?.chord;

    expect(acorde).toBeDefined();
    expect(formatChord(exigirAcorde(acorde), preferSharps)).toBe('A#');
    expect(formatChord(exigirAcorde(acorde), preferFlats)).toBe('Bb');
  });

  it('mantém o tom menor ao transpor', () => {
    const menor = parseChart('{key: Am}\n[Am]Letra [Dm]aqui');
    const transposto = transposeChartToKey(menor, lerTom('Cm'));

    expect(formatKey(exigirTom(transposto.key))).toBe('Cm');
    expect(acordesDe(transposto)).toEqual(['Cm', 'Fm']);
  });
});
