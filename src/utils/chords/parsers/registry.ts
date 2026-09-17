import type { ChartDocument } from '../types';

import { looksLikeChordPro, parseChordPro } from './chordpro-parser';
import { parseChordsOverLyrics } from './chords-over-lyrics-parser';

export type ChartFormat = 'chordpro' | 'acordes-sobre-letra';

export interface ChartParser {
  readonly format: ChartFormat;
  readonly label: string;
  canParse(bruto: string): boolean;
  parse(bruto: string): ChartDocument;
}

const chordProParser: ChartParser = {
  format: 'chordpro',
  label: 'ChordPro',
  canParse: looksLikeChordPro,
  parse: parseChordPro,
};

const acordesSobreLetraParser: ChartParser = {
  format: 'acordes-sobre-letra',
  label: 'Acordes sobre a letra',
  // Formato de fallback: qualquer texto colado que não seja ChordPro.
  canParse: () => true,
  parse: parseChordsOverLyrics,
};

/** Registry do Strategy de leitura: novo formato entra aqui, sem tocar no resto. */
export const chartParsers: ChartParser[] = [chordProParser, acordesSobreLetraParser];

export function detectFormat(bruto: string): ChartFormat {
  return (chartParsers.find((parser) => parser.canParse(bruto)) as ChartParser).format;
}

export function getParser(format: ChartFormat): ChartParser {
  return chartParsers.find((parser) => parser.format === format) as ChartParser;
}

export function parseChart(bruto: string, format?: ChartFormat): ChartDocument {
  return getParser(format ?? detectFormat(bruto)).parse(bruto);
}
