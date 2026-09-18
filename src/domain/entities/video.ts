import { z } from 'zod';

/** Id de vídeo do YouTube: 11 caracteres do alfabeto base64 url-safe. */
export const videoIdSchema = z.string().regex(/^[A-Za-z0-9_-]{11}$/, {
  message: 'Identificador de vídeo inválido',
});

export const videoSearchResultSchema = z.object({
  videoId: videoIdSchema,
  title: z.string().min(1),
  channel: z.string(),
  thumbnailUrl: z.string(),
  durationSeconds: z.number().int().min(0),
});

export type VideoSearchResult = z.infer<typeof videoSearchResultSchema>;

export function videoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Extrai o id de uma URL do YouTube em qualquer das formas aceitas. */
export function videoIdFromUrl(url: string | null): string | null {
  if (url === null) {
    return null;
  }

  const casamento = /(?:watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url);

  return casamento?.[1] ?? null;
}

export function formatDuration(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;

  return `${minutos.toString()}:${resto.toString().padStart(2, '0')}`;
}
