# Configurar a busca de vídeos do YouTube

A busca de vídeos (Fase 6) passa por uma Supabase Edge Function,
[`supabase/functions/youtube-search`](../supabase/functions/youtube-search/index.ts), que guarda a
chave da YouTube Data API no servidor. **A chave nunca vai para o app, para o `.env` nem para o
repositório.**

## 1. Criar a chave no Google Cloud

1. Acesse <https://console.cloud.google.com/> com a conta Google que vai ser dona da chave.
2. No seletor de projetos, no topo da página, clique em **Novo projeto**. Dê o nome `Unissono` e
   clique em **Criar**. Quando terminar, selecione esse projeto no mesmo seletor.
3. No menu lateral, abra **APIs e serviços → Biblioteca**. Busque por **YouTube Data API v3**,
   abra o resultado e clique em **Ativar**.
4. Vá em **APIs e serviços → Credenciais**, clique em **+ Criar credenciais → Chave de API**. A
   chave aparece numa janela: copie.
5. Ainda na janela (ou clicando no nome da chave na lista), restrinja a chave:
   - **Restrições de API** → **Restringir chave** → marque somente **YouTube Data API v3** → **Salvar**.
   - **Restrições de aplicativo**: deixe **Nenhuma**. A chamada sai dos servidores da Supabase, que
     não têm IP fixo; restringir por IP ou por app Android/iOS bloquearia a própria função.

Não é preciso configurar tela de consentimento OAuth nem ativar faturamento: a cota gratuita
padrão (10.000 unidades por dia) funciona só com a chave.

## 2. Guardar a chave na Supabase

**Pelo painel:** projeto `unissono` → **Edge Functions → Secrets** → **Add new secret**:

| Name              | Value           |
| ----------------- | --------------- |
| `YOUTUBE_API_KEY` | a chave copiada |

**Ou pela CLI** (exige `npx supabase login`):

```bash
npx supabase secrets set YOUTUBE_API_KEY=<sua-chave> --project-ref <ref-do-projeto>
```

A função lê o segredo a cada chamada — não é preciso publicar de novo.

## 3. Conferir

No app, logado como líder: abra uma música → **Buscar vídeo no YouTube** → **Buscar**.

| Situação                 | Resposta da função                          |
| ------------------------ | ------------------------------------------- |
| Sem sessão               | 401 — Sessão necessária                     |
| Músico                   | 403 — Apenas a liderança pode buscar vídeos |
| Líder, sem a chave       | 500 — Busca de vídeos ainda não configurada |
| Líder, cota do dia gasta | 429 — Limite diário de buscas atingido      |

## Cota

Cada busca consome **101 unidades** (100 da busca + 1 da consulta de duração), o que dá cerca de
**99 buscas por dia**. Por isso a busca só roda quando o líder toca em **Buscar**, nunca a cada
tecla. O consumo aparece em **APIs e serviços → YouTube Data API v3 → Cotas**.

## Se a chave vazar

Em **Credenciais**, apague a chave, crie outra e troque o segredo `YOUTUBE_API_KEY` na Supabase.
Nada muda no app.
