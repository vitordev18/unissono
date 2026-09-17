import { z } from 'zod';

import { detectFormat, formatKey, getParser, toChordPro } from '@/utils/chords';
import type { ChartDocument, ChartFormat } from '@/utils/chords';

import { AuthError } from '../entities/errors';
import type { SongChart } from '../entities/song';
import type { SongChartRepository } from '../repositories/song-chart-repository';

const TAMANHO_MAXIMO = 200_000;

export const importChartSchema = z.object({
  songId: z.uuid(),
  raw: z
    .string()
    .trim()
    .min(1, { message: 'Cole a cifra antes de continuar' })
    .max(TAMANHO_MAXIMO, { message: 'Cifra grande demais' }),
  format: z.enum(['chordpro', 'acordes-sobre-letra']).optional(),
});

export type ImportChartInput = z.infer<typeof importChartSchema>;

export interface ChartPreview {
  format: ChartFormat;
  document: ChartDocument;
  chordpro: string;
  /** Trechos que não foram reconhecidos como acorde e ficaram como texto. */
  avisos: string[];
}

/** Pré-visualização: o líder confere antes de salvar (US-24). */
export function previewChart(raw: string, format?: ChartFormat): ChartPreview {
  const formatoEscolhido = format ?? detectFormat(raw);
  const document = getParser(formatoEscolhido).parse(raw);
  const avisos: string[] = [];

  if (document.key === null) {
    avisos.push('Não identificamos o tom da cifra. Escolha o tom antes de salvar.');
  }

  const totalDeAcordes = document.sections
    .flatMap((section) => section.lines)
    .flatMap((line) => line.segments)
    .filter((segment) => segment.chord !== null).length;

  if (totalDeAcordes === 0) {
    avisos.push('Nenhum acorde reconhecido — confira se o formato está correto.');
  }

  return { format: formatoEscolhido, document, chordpro: toChordPro(document), avisos };
}

export type ImportChart = (input: ImportChartInput) => Promise<SongChart>;

export function createImportChart(deps: { charts: SongChartRepository }): ImportChart {
  return async function importChart(input) {
    const validacao = importChartSchema.safeParse(input);

    if (!validacao.success) {
      throw new AuthError(
        'dados-invalidos',
        validacao.error.issues[0]?.message ?? 'Dados inválidos',
      );
    }

    const preview = previewChart(validacao.data.raw, validacao.data.format);

    if (preview.document.key === null) {
      throw new AuthError('dados-invalidos', 'Escolha o tom da cifra antes de salvar.');
    }

    return deps.charts.create({
      songId: validacao.data.songId,
      contentChordPro: preview.chordpro,
      key: formatKey(preview.document.key),
    });
  };
}
