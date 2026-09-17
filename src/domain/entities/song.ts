import { z } from 'zod';

const tomValido = /^[A-G](#|b)?m?$/;

export const songSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200),
  artist: z.string().nullable(),
  defaultKey: z.string().regex(tomValido, { message: 'Tom inválido' }).nullable(),
  bpm: z.number().int().min(20).max(300).nullable(),
  tags: z.array(z.string()),
  youtubeUrl: z.string().nullable(),
});

export type Song = z.infer<typeof songSchema>;

export const songChartSchema = z.object({
  id: z.uuid(),
  songId: z.uuid(),
  contentChordPro: z.string().min(1),
  key: z.string().regex(tomValido, { message: 'Tom inválido' }),
  version: z.number().int().positive(),
  createdAt: z.string(),
});

export type SongChart = z.infer<typeof songChartSchema>;

/** Entrada do formulário de música (fronteira de dados, US-40). */
export const newSongSchema = z.object({
  title: z.string().trim().min(1, { message: 'Informe o título' }).max(200),
  artist: z.string().trim().max(200).nullable(),
  defaultKey: z.string().regex(tomValido, { message: 'Tom inválido' }).nullable(),
  bpm: z.number().int().min(20).max(300).nullable(),
  tags: z.array(z.string().trim().toLowerCase().min(1)).max(10),
});

export type NewSong = z.infer<typeof newSongSchema>;
