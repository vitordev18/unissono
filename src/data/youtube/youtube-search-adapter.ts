import { z } from 'zod';

import { AuthError } from '@/domain/entities/errors';
import { videoSearchResultSchema, type VideoSearchResult } from '@/domain/entities/video';
import type { VideoSearchRepository } from '@/domain/repositories/video-search-repository';

import type { UnissonoClient } from '../supabase/client';

/** Contrato de saída da Edge Function — validado antes de virar entidade. */
const respostaSchema = z.object({
  resultados: z.array(
    z.object({
      videoId: z.string(),
      titulo: z.string(),
      canal: z.string(),
      thumbnailUrl: z.string(),
      duracaoSegundos: z.number(),
    }),
  ),
});

const erroSchema = z.object({ erro: z.string() });

/**
 * Adapter: YouTube Data API → contrato interno de busca.
 *
 * A chamada vai para a Edge Function, que guarda a chave da API e confere o
 * papel de quem pediu. O app só conhece este contrato — trocar de provedor de
 * busca de vídeo não encosta em nenhuma tela.
 */
export function createYouTubeSearchAdapter(client: UnissonoClient): VideoSearchRepository {
  return {
    async search(termo: string): Promise<VideoSearchResult[]> {
      // invoke() devolve data: any; a validação com Zod logo abaixo é a
      // fronteira que transforma isso em dado confiável.
      const resposta: { data: unknown; error: unknown } = await client.functions.invoke(
        'youtube-search',
        { body: { termo } },
      );
      const { data, error } = resposta;

      if (error) {
        const corpo = await lerErro(error);

        throw new AuthError('desconhecido', corpo);
      }

      const validacao = respostaSchema.safeParse(data);

      if (!validacao.success) {
        throw new AuthError('desconhecido', 'Resposta inesperada da busca de vídeos.');
      }

      return validacao.data.resultados.map((item) =>
        videoSearchResultSchema.parse({
          videoId: item.videoId,
          title: item.titulo,
          channel: item.canal,
          thumbnailUrl: item.thumbnailUrl,
          durationSeconds: Math.max(0, Math.round(item.duracaoSegundos)),
        }),
      );
    },
  };
}

/**
 * O supabase-js embrulha erros HTTP; a mensagem útil (cota estourada, falta de
 * permissão) vem no corpo da resposta.
 */
async function lerErro(error: unknown): Promise<string> {
  const comContexto = error as { context?: { json?: () => Promise<unknown> } };

  try {
    const corpo = await comContexto.context?.json?.();
    const validacao = erroSchema.safeParse(corpo);

    if (validacao.success) {
      return validacao.data.erro;
    }
  } catch {
    // Sem corpo legível: cai na mensagem genérica abaixo.
  }

  return 'Não foi possível buscar vídeos agora.';
}
