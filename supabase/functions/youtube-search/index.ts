/**
 * Busca de vídeos no YouTube — Uníssono (Fase 6).
 *
 * Por que uma Edge Function e não uma chamada direta do app:
 * a chave da YouTube Data API é extraível de qualquer bundle mobile (OWASP M1).
 * Aqui ela fica no servidor, e a cota diária (10.000 unidades; cada busca custa
 * 100) fica atrás de uma verificação de papel — só o líder busca.
 *
 * Deno / Supabase Edge Runtime.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CABECALHOS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ItemDaBusca {
  id: { videoId?: string };
  snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string } } };
}

interface ItemDeDetalhe {
  id: string;
  contentDetails: { duration: string };
}

/** ISO-8601 (PT4M13S) para segundos. */
function duracaoEmSegundos(iso: string): number {
  const casamento = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);

  if (!casamento) {
    return 0;
  }

  const horas = Number(casamento[1] ?? 0);
  const minutos = Number(casamento[2] ?? 0);
  const segundos = Number(casamento[3] ?? 0);

  return horas * 3600 + minutos * 60 + segundos;
}

function responder(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CABECALHOS_CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (requisicao: Request) => {
  if (requisicao.method === 'OPTIONS') {
    return new Response('ok', { headers: CABECALHOS_CORS });
  }

  const autorizacao = requisicao.headers.get('Authorization');

  if (!autorizacao) {
    return responder({ erro: 'Sessão necessária.' }, 401);
  }

  // O cliente herda o JWT de quem chamou: a leitura de profiles passa pela RLS.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: autorizacao } } },
  );

  const { data: usuario, error: erroDeAuth } = await supabase.auth.getUser();

  if (erroDeAuth || !usuario.user) {
    return responder({ erro: 'Sessão inválida.' }, 401);
  }

  const { data: perfil } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', usuario.user.id)
    .maybeSingle();

  if (!perfil || perfil.role !== 'lider' || !perfil.is_active) {
    return responder({ erro: 'Apenas a liderança pode buscar vídeos.' }, 403);
  }

  // A configuração só é revelada depois de autenticar e conferir o papel:
  // quem não pode buscar não precisa saber se a busca está configurada.
  const chave = Deno.env.get('YOUTUBE_API_KEY');

  if (!chave) {
    return responder({ erro: 'Busca de vídeos ainda não configurada.' }, 500);
  }

  let termo = '';

  try {
    const corpo = (await requisicao.json()) as { termo?: unknown };

    termo = typeof corpo.termo === 'string' ? corpo.termo.trim() : '';
  } catch {
    return responder({ erro: 'Requisição inválida.' }, 400);
  }

  if (termo.length === 0 || termo.length > 120) {
    return responder({ erro: 'Informe o que buscar.' }, 400);
  }

  const urlDaBusca = new URL('https://www.googleapis.com/youtube/v3/search');

  urlDaBusca.searchParams.set('part', 'snippet');
  urlDaBusca.searchParams.set('type', 'video');
  urlDaBusca.searchParams.set('maxResults', '10');
  urlDaBusca.searchParams.set('q', termo);
  urlDaBusca.searchParams.set('key', chave);

  const respostaDaBusca = await fetch(urlDaBusca);

  if (respostaDaBusca.status === 403) {
    return responder({ erro: 'Limite diário de buscas atingido. Tente amanhã.' }, 429);
  }

  if (!respostaDaBusca.ok) {
    return responder({ erro: 'Não foi possível buscar vídeos agora.' }, 502);
  }

  const busca = (await respostaDaBusca.json()) as { items?: ItemDaBusca[] };
  const itens = (busca.items ?? []).filter((item) => typeof item.id.videoId === 'string');
  const ids = itens.map((item) => item.id.videoId as string);

  // videos.list custa 1 unidade e é o que traz a duração — usada também para
  // calibrar a rolagem automática da cifra (Fase 5).
  const duracoes = new Map<string, number>();

  if (ids.length > 0) {
    const urlDeDetalhes = new URL('https://www.googleapis.com/youtube/v3/videos');

    urlDeDetalhes.searchParams.set('part', 'contentDetails');
    urlDeDetalhes.searchParams.set('id', ids.join(','));
    urlDeDetalhes.searchParams.set('key', chave);

    const respostaDeDetalhes = await fetch(urlDeDetalhes);

    if (respostaDeDetalhes.ok) {
      const detalhes = (await respostaDeDetalhes.json()) as { items?: ItemDeDetalhe[] };

      for (const item of detalhes.items ?? []) {
        duracoes.set(item.id, duracaoEmSegundos(item.contentDetails.duration));
      }
    }
  }

  return responder({
    resultados: itens.map((item) => ({
      videoId: item.id.videoId as string,
      titulo: item.snippet.title,
      canal: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium?.url ?? '',
      duracaoSegundos: duracoes.get(item.id.videoId as string) ?? 0,
    })),
  });
});
