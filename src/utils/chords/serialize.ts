import { keySignatureAccidentals, type AccidentalStrategy } from './accidentals';
import { formatChord } from './chord';
import { formatKey } from './notes';
import type { ChartDocument, SectionType } from './types';

const DIRETIVA_DE_SECAO: Record<SectionType, string | null> = {
  intro: 'start_of_intro',
  verse: 'start_of_verse',
  chorus: 'start_of_chorus',
  bridge: 'start_of_bridge',
  ending: 'start_of_ending',
  other: null,
};

/** Serializa de volta para ChordPro — o formato guardado em song_charts. */
export function toChordPro(
  doc: ChartDocument,
  strategy: AccidentalStrategy = keySignatureAccidentals,
): string {
  const linhas: string[] = [];

  if (doc.title !== null) {
    linhas.push(`{title: ${doc.title}}`);
  }

  if (doc.artist !== null) {
    linhas.push(`{artist: ${doc.artist}}`);
  }

  if (doc.key !== null) {
    linhas.push(`{key: ${formatKey(doc.key)}}`);
  }

  for (const section of doc.sections) {
    const abertura = DIRETIVA_DE_SECAO[section.type];

    if (linhas.length > 0) {
      linhas.push('');
    }

    if (section.label !== null && abertura === null) {
      linhas.push(`{comment: ${section.label}}`);
    } else if (abertura !== null) {
      linhas.push(section.label === null ? `{${abertura}}` : `{${abertura}: ${section.label}}`);
    }

    for (const line of section.lines) {
      const texto = line.segments
        .map((segment) => {
          const acorde =
            segment.chord === null ? '' : `[${formatChord(segment.chord, strategy, doc.key)}]`;

          return `${acorde}${segment.lyric}`;
        })
        .join('');

      linhas.push(texto);
    }

    if (abertura !== null) {
      linhas.push(`{${abertura.replace('start_of', 'end_of')}}`);
    }
  }

  return linhas.join('\n');
}
