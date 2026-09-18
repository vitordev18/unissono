import { createYouTubeSearchAdapter } from '@/data/youtube/youtube-search-adapter';
import type { UnissonoClient } from '@/data/supabase/client';

interface RespostaSimulada {
  data: unknown;
  error: unknown;
}

function clienteCom(resposta: RespostaSimulada, registrar?: (corpo: unknown) => void) {
  return {
    functions: {
      invoke: (_nome: string, opcoes: { body: unknown }) => {
        registrar?.(opcoes.body);

        return Promise.resolve(resposta);
      },
    },
  } as unknown as UnissonoClient;
}

describe('YouTubeSearchAdapter', () => {
  it('chama a Edge Function e converte o resultado para o contrato do domínio', async () => {
    const corpos: unknown[] = [];
    const adapter = createYouTubeSearchAdapter(
      clienteCom(
        {
          data: {
            resultados: [
              {
                videoId: 'ABCDEFGHIJK',
                titulo: 'Música de teste (ao vivo)',
                canal: 'Canal de Teste',
                thumbnailUrl: 'https://i.ytimg.com/vi/ABCDEFGHIJK/mqdefault.jpg',
                duracaoSegundos: 250.4,
              },
            ],
          },
          error: null,
        },
        (corpo) => corpos.push(corpo),
      ),
    );

    const resultados = await adapter.search('música de teste');

    expect(corpos).toEqual([{ termo: 'música de teste' }]);
    expect(resultados).toEqual([
      {
        videoId: 'ABCDEFGHIJK',
        title: 'Música de teste (ao vivo)',
        channel: 'Canal de Teste',
        thumbnailUrl: 'https://i.ytimg.com/vi/ABCDEFGHIJK/mqdefault.jpg',
        durationSeconds: 250,
      },
    ]);
  });

  it('mostra a mensagem que a função devolveu quando a cota estoura', async () => {
    const adapter = createYouTubeSearchAdapter(
      clienteCom({
        data: null,
        error: {
          context: {
            json: () =>
              Promise.resolve({ erro: 'Limite diário de buscas atingido. Tente amanhã.' }),
          },
        },
      }),
    );

    await expect(adapter.search('qualquer coisa')).rejects.toThrow(
      'Limite diário de buscas atingido. Tente amanhã.',
    );
  });

  it('cai numa mensagem genérica quando o erro não tem corpo legível', async () => {
    const adapter = createYouTubeSearchAdapter(
      clienteCom({ data: null, error: new Error('falha de rede') }),
    );

    await expect(adapter.search('qualquer coisa')).rejects.toThrow(
      'Não foi possível buscar vídeos agora.',
    );
  });

  it('recusa resposta fora do formato combinado', async () => {
    const adapter = createYouTubeSearchAdapter(
      clienteCom({ data: { resultados: [{ videoId: 123 }] }, error: null }),
    );

    await expect(adapter.search('qualquer coisa')).rejects.toThrow(
      'Resposta inesperada da busca de vídeos.',
    );
  });
});
