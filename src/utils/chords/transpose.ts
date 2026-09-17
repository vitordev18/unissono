import { keySignatureAccidentals, type AccidentalStrategy } from './accidentals';
import { formatChord, transposeChord } from './chord';
import { normalizeSemitones, semitonesBetween } from './notes';
import type { ChartDocument, MusicalKey } from './types';

export interface TransposeOptions {
  semitones: number;
  strategy?: AccidentalStrategy;
}

/** Transpõe o documento inteiro, preservando letra, seções e sufixos. */
export function transposeChart(doc: ChartDocument, options: TransposeOptions): ChartDocument {
  const semitons = normalizeSemitones(options.semitones);

  if (semitons === 0) {
    return doc;
  }

  const novoTom: MusicalKey | null =
    doc.key === null
      ? null
      : { root: normalizeSemitones(doc.key.root + semitons), minor: doc.key.minor };

  return {
    ...doc,
    key: novoTom,
    sections: doc.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({
        segments: line.segments.map((segment) => ({
          ...segment,
          chord: segment.chord === null ? null : transposeChord(segment.chord, semitons),
        })),
      })),
    })),
  };
}

/** Transpõe do tom atual do documento para o tom pedido. */
export function transposeChartToKey(doc: ChartDocument, destino: MusicalKey): ChartDocument {
  if (doc.key === null) {
    return doc;
  }

  return transposeChart(doc, { semitones: semitonesBetween(doc.key, destino) });
}

/** Texto de cada acorde já grafado — o que a tela desenha. */
export function renderChord(
  doc: ChartDocument,
  chordIndex: { sectionIndex: number; lineIndex: number; segmentIndex: number },
  strategy: AccidentalStrategy = keySignatureAccidentals,
): string | null {
  const segmento =
    doc.sections[chordIndex.sectionIndex]?.lines[chordIndex.lineIndex]?.segments[
      chordIndex.segmentIndex
    ];

  if (!segmento?.chord) {
    return null;
  }

  return formatChord(segmento.chord, strategy, doc.key);
}
