# Uníssono — Plano de Produto

> Status: **rascunho para aprovação (Fase 0)** · Última revisão: 2026-09-14

## 1. Visão

Uníssono é o app mobile (Android + iOS) do ministério de louvor: um único lugar para saber **quando** tocar (escalas), **o que** tocar (repertório e cifras) e **como** tocar (treino com vídeo de referência).

### 1.1 Problema

| Hoje                                        | Consequência                                                         |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Escalas enviadas em grupos de mensagem      | Mensagens se perdem; ninguém sabe a versão final                     |
| Cifras em PDFs, prints e sites diversos     | Tons divergentes entre músicos; transposição manual e sujeita a erro |
| Vídeos de referência compartilhados avulsos | Músico não encontra a versão/arranjo combinado                       |
| Repertório só na cabeça do líder            | Músicas repetidas ou esquecidas; difícil onboard de novos músicos    |

### 1.2 Objetivos e métricas de sucesso (MVP)

| Objetivo               | Métrica                                              | Meta (90 dias após lançamento interno)   |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------- |
| Centralizar escalas    | % de cultos com escala publicada no app              | ≥ 90%                                    |
| Reduzir erro de tom    | Relatos de "tom errado" no ensaio                    | Queda percebida pelo líder (qualitativo) |
| Engajamento de preparo | Músicos escalados que abriram a cifra antes do culto | ≥ 70%                                    |
| Adoção                 | Músicos ativos / total do ministério                 | ≥ 80%                                    |

## 2. Personas

### P1 — Líder do ministério

- Monta a escala semanal, escolhe as músicas e define o tom de cada uma.
- Usa o celular no dia a dia e o app durante o ensaio.
- **Dores:** confirmar disponibilidade, garantir que todos tenham a cifra certa no tom certo.
- **Precisa de:** criar escala em poucos minutos, reaproveitar o repertório, ver quem confirmou.

### P2 — Músico voluntário (instrumentista/vocal)

- Toca 2–4 vezes por mês, tem pouco tempo livre para ensaiar.
- **Dores:** descobrir tarde que foi escalado, não achar o vídeo da versão combinada, tom diferente do que ensaiou.
- **Precisa de:** notificação/visão clara da próxima escala, cifra no tom do culto, vídeo e treino no mesmo lugar.

### P3 — Músico em formação

- Entrou recentemente, ainda está "tirando" o repertório.
- **Dores:** acompanhar trechos rápidos, lembrar dos detalhes do arranjo.
- **Precisa de:** loop A-B, velocidade reduzida, anotações pessoais, setlists próprias de estudo.

## 3. Papéis e permissões

| Recurso                | Líder                                                 | Músico                                                                        |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| Perfis                 | Lê todos; altera papel/instrumento de qualquer membro | Lê membros; edita apenas nome/avatar/instrumento **próprios** (nunca o papel) |
| Músicas (`songs`)      | CRUD                                                  | Leitura                                                                       |
| Cifras (`song_charts`) | CRUD (cria novas versões)                             | Leitura                                                                       |
| Escalas e atribuições  | CRUD                                                  | Leitura (confirmação de presença → backlog, ver §6)                           |
| Repertórios            | CRUD                                                  | Leitura                                                                       |
| Setlists pessoais      | CRUD apenas das **próprias**                          | CRUD apenas das **próprias**                                                  |
| Sessões de treino      | CRUD apenas das **próprias**                          | CRUD apenas das **próprias**                                                  |
| Preferência de tema    | Local ao dispositivo                                  | Local ao dispositivo                                                          |

> Setlists e sessões de treino são **privadas mesmo para o líder** (dados pessoais de estudo). Ver decisão pendente DP-06.

## 4. Épicos e histórias de usuário

Legenda de prioridade (MoSCoW): **M** = Must (MVP) · **S** = Should (MVP se couber) · **C** = Could (backlog).

### E1 — Autenticação e papéis (Fase 3)

| ID    | História                                                                                  | Prioridade | Critérios de aceite                                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | Como membro, quero entrar com e-mail e senha para acessar o ministério.                   | M          | Erro genérico em credencial inválida (sem revelar se o e-mail existe); sessão persiste entre aberturas do app; logout limpa cache local. |
| US-02 | Como membro, quero recuperar minha senha.                                                 | M          | Link de redefinição via Supabase Auth; deep link abre o app na tela de nova senha.                                                       |
| US-03 | Como líder, quero convidar novos membros para que só pessoas do ministério tenham acesso. | M          | Cadastro público desabilitado; convite por e-mail; perfil nasce com papel `musico`.                                                      |
| US-04 | Como líder, quero promover um músico a líder.                                             | S          | Somente líder altera `role`; tentativa via API por músico é bloqueada pelo banco.                                                        |
| US-05 | Como sistema, quero bloquear telas de líder para músicos.                                 | M          | Guarda de rota no app **e** RLS no banco (a UI nunca é a única barreira).                                                                |

### E2 — Escalas de culto (Fase 7)

| ID    | História                                                                             | Prioridade | Critérios de aceite                                                                                                            |
| ----- | ------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| US-10 | Como líder, quero criar uma escala (data, tipo de culto).                            | M          | Validação Zod; status inicial `rascunho`.                                                                                      |
| US-11 | Como líder, quero atribuir músicos por instrumento/função.                           | M          | Mesmo músico não pode ter duas funções conflitantes no mesmo culto (regra configurável); busca de membro por nome/instrumento. |
| US-12 | Como líder, quero definir as músicas da escala, em ordem e com o tom do culto.       | M          | Reordenar por arrastar; tom do culto pode diferir do `default_key` da música.                                                  |
| US-13 | Como líder, quero publicar a escala.                                                 | M          | Status `rascunho → publicada`; músicos só veem escalas publicadas.                                                             |
| US-14 | Como músico, quero ver minhas próximas escalas na tela inicial.                      | M          | Ordenadas por data; destaque para a próxima; atualização em tempo real (Realtime).                                             |
| US-15 | Como músico, quero abrir a cifra de uma música direto da escala, já no tom do culto. | M          | Um toque da escala → cifra transposta.                                                                                         |
| US-16 | Como músico, quero confirmar ou recusar presença.                                    | C          | Backlog (exige coluna/tabela nova).                                                                                            |

### E3 — Cifras (Fases 4 e 5)

| ID    | História                                                                                | Prioridade | Critérios de aceite                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-20 | Como músico, quero ver a cifra com acordes alinhados sobre a letra.                     | M          | Acordes nunca quebram desalinhados da sílaba; fonte monoespaçada para acordes; seções (verso, refrão) destacadas.                                                                             |
| US-21 | Como músico, quero transpor a cifra para qualquer um dos 12 tons.                       | M          | Transposição reversível (+n −n = original); acordes com baixo (`D/F#`), extensões (`C7M(9)`, `Asus4`), menores e diminutos preservados; grafia sustenido/bemol coerente com o tom de destino. |
| US-22 | Como músico, quero aumentar/diminuir a fonte.                                           | M          | Faixa 12–32 pt; preferência persistida por dispositivo.                                                                                                                                       |
| US-23 | Como membro, quero buscar cifras no catálogo interno por título, artista ou trecho.     | M          | Busca tolerante a acentos (`unaccent`); resultados paginados.                                                                                                                                 |
| US-24 | Como líder, quero importar uma cifra colando texto (ChordPro ou "acordes sobre letra"). | M          | Detecção automática do formato com confirmação; pré-visualização antes de salvar; conteúdo sempre fornecido pelo usuário (sem scraping).                                                      |
| US-25 | Como líder, quero importar a cifra de um arquivo `.txt`/`.cho` do dispositivo.          | S          | Limite de tamanho (ex.: 200 KB); validação de encoding UTF-8.                                                                                                                                 |
| US-26 | Como líder, quero editar uma cifra, gerando nova versão.                                | M          | Versão anterior preservada; cifra exibida por padrão = versão mais recente.                                                                                                                   |
| US-27 | Como músico, quero rolagem automática com play/pause e ajuste de velocidade.            | M          | Velocidade inicial derivada do BPM e da duração (ver DP-07); ajuste fino ±; tela não apaga durante a rolagem (`expo-keep-awake`).                                                             |
| US-28 | Como músico, quero ocultar os acordes (modo só letra) para vocal.                       | S          | Alternância na barra de ferramentas.                                                                                                                                                          |

### E4 — YouTube (Fase 6)

| ID    | História                                                            | Prioridade | Critérios de aceite                                                                                       |
| ----- | ------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| US-30 | Como líder, quero buscar um vídeo no YouTube e vinculá-lo à música. | M          | Busca retorna título, canal, miniatura, duração; vínculo salvo em `songs.youtube_url`.                    |
| US-31 | Como músico, quero assistir ao vídeo dentro do app.                 | M          | Player oficial embutido (IFrame API); sem download ou extração de áudio; sem reprodução em segundo plano. |

### E5 — Repertório (Fase 8)

| ID    | História                                                                   | Prioridade | Critérios de aceite                                            |
| ----- | -------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| US-40 | Como líder, quero cadastrar músicas (título, artista, tom, BPM, tags).     | M          | Validação Zod; tags normalizadas (minúsculas, sem duplicatas). |
| US-41 | Como líder, quero organizar músicas em repertórios (ex.: "Ceia", "Natal"). | M          | Ordenação manual; música pode estar em vários repertórios.     |
| US-42 | Como membro, quero filtrar o repertório por tag, tom e artista.            | M          | Filtros combináveis; lista virtualizada (`FlatList`).          |
| US-43 | Como líder, quero ver quando uma música foi tocada pela última vez.        | S          | Derivado das escalas publicadas.                               |

### E6 — Treino (Fase 9)

| ID    | História                                                                 | Prioridade | Critérios de aceite                                                          |
| ----- | ------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------- |
| US-50 | Como músico, quero marcar um trecho A-B do vídeo e repeti-lo em loop.    | M          | Precisão aceitável de ±0,5 s (limitação do player embutido); A < B validado. |
| US-51 | Como músico, quero reduzir a velocidade do vídeo.                        | M          | Velocidades suportadas pelo player: 0,25×–2×.                                |
| US-52 | Como músico, quero anotar observações pessoais sobre a música.           | M          | Visíveis apenas para mim (RLS); salvamento automático com debounce.          |
| US-53 | Como músico, quero ver a cifra e o vídeo na mesma tela durante o treino. | S          | Layout dividido (vídeo fixo no topo, cifra rolável abaixo).                  |

### E7 — Setlists pessoais (Fase 10)

| ID    | História                                                               | Prioridade | Critérios de aceite                                       |
| ----- | ---------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| US-60 | Como músico, quero criar setlists pessoais independentes das escalas.  | M          | CRUD; RLS de propriedade.                                 |
| US-61 | Como músico, quero adicionar e reordenar músicas na setlist.           | M          | Arrastar para reordenar; sem duplicatas na mesma setlist. |
| US-62 | Como músico, quero duplicar uma escala como setlist pessoal de estudo. | C          | Backlog.                                                  |

### E8 — Tema (Fase 11)

| ID    | História                                                             | Prioridade | Critérios de aceite                                                                  |
| ----- | -------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| US-70 | Como usuário, quero alternar entre tema claro, escuro ou do sistema. | M          | Três opções; persistência local; padrão = sistema; contraste WCAG AA nos dois temas. |

## 5. Escopo do MVP

**Dentro do MVP:** todas as histórias **M** acima, entregues nas Fases 1–13.

**Fora do MVP (backlog imediato, pós-MVP):**

- US-16 confirmação de presença · US-43 última execução · US-62 escala → setlist.
- Múltiplos instrumentos por membro (hoje `profiles.instrument` é campo único).
- Histórico/diff visual entre versões de cifra.
- Tudo o que está no `ROADMAP.md` (offline, push, PDF, colaboração em tempo real, multi-igreja, metrônomo, OCR etc.).

## 6. Requisitos não funcionais

| Categoria          | Requisito                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plataformas        | Android 10+ e iOS 16+ (confirmar mínimo do Expo SDK escolhido na Fase 1)                                                                                                              |
| Desempenho         | Abertura de cifra < 1 s com cache quente; listas com 1.000+ músicas fluidas (60 fps)                                                                                                  |
| Segurança          | RLS em 100% das tabelas; validação Zod em toda fronteira; sessão armazenada de forma segura; nenhum segredo no bundle além da _anon/publishable key_ do Supabase (pública por design) |
| Privacidade (LGPD) | Coleta mínima (nome, e-mail, instrumento, avatar opcional); exclusão de conta sob pedido; anotações e setlists privadas                                                               |
| Acessibilidade     | Rótulos de acessibilidade em controles; suporte a fonte do sistema; alvos de toque ≥ 44 pt                                                                                            |
| Idioma             | pt-BR (textos centralizados para futura i18n)                                                                                                                                         |
| Conectividade      | Online-first; mensagens claras sem rede; cache do TanStack Query para leitura recente                                                                                                 |
| Qualidade          | TypeScript `strict`, zero `any`; cobertura mínima de 80% em `src/domain` e `src/utils`                                                                                                |

## 7. Riscos

| #   | Risco                                                                                      | Impacto | Mitigação                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Direitos autorais** de cifras e letras                                                   | Alto    | Sem scraping; conteúdo inserido pela própria igreja; catálogo privado ao ministério; termo de uso lembrando a responsabilidade de licenciamento (ex.: CCLI) |
| R2  | **Chave da YouTube Data API extraível do app** (OWASP M1)                                  | Médio   | Busca via Supabase Edge Function que guarda a chave no servidor (ADR-003)                                                                                   |
| R3  | **Cota da YouTube Data API** (10.000 unidades/dia; cada busca custa 100 → ~100 buscas/dia) | Médio   | Busca só para líder; cache de resultados; debounce                                                                                                          |
| R4  | **Escalada de privilégio** (músico alterando o próprio `role`)                             | Alto    | Política/trigger que impede update de `role` por não-líder; testes de RLS dedicados                                                                         |
| R5  | Precisão do loop A-B e da velocidade no player embutido (WebView)                          | Médio   | Documentar tolerância; polling de `getCurrentTime`; testar em dispositivo real                                                                              |
| R6  | Build/teste iOS a partir de ambiente Windows                                               | Médio   | EAS Build na nuvem; E2E iOS em CI macOS; E2E local em Android                                                                                               |
| R7  | Testes de integração de RLS exigem Supabase local (Docker)                                 | Baixo   | Docker Desktop ou projeto Supabase de _staging_ dedicado                                                                                                    |
| R8  | Single-tenant hoje, multi-igreja no roadmap                                                | Médio   | Ver DP-05 — decisão agora evita migração cara depois                                                                                                        |

## 8. Decisões pendentes (bloqueiam a Fase 1)

| ID    | Decisão                                      | Recomendação                                                       | Motivo                                                                                                                                                                                                            |
| ----- | -------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DP-01 | Roteador: Expo Router × React Navigation     | **Expo Router**                                                    | O `<directory_structure>` já usa `app/(auth)` e `app/(tabs)`; Expo Router roda sobre React Navigation, com rotas tipadas e deep links nativos. O `<tech_stack>` citava React Navigation — há conflito a resolver. |
| DP-02 | Estilização: NativeWind × styled-components  | **NativeWind**                                                     | Tema claro/escuro via `dark:`; sem runtime CSS-in-JS; styled-components tem manutenção reduzida para RN.                                                                                                          |
| DP-03 | E2E: Maestro × Detox                         | **Maestro**                                                        | Setup simples, YAML, funciona com builds Expo; Detox exige config nativa e é frágil com Expo.                                                                                                                     |
| DP-04 | Busca YouTube: chave no app × Edge Function  | **Edge Function**                                                  | Evita chave exposta (R2). Requer `deploy_edge_function` (ainda "sem servidor próprio").                                                                                                                           |
| DP-05 | Multi-igreja: `ministry_id` agora × depois   | **Adiar**, single-tenant                                           | Escopo mínimo; custo de migração aceito. Se multi-igreja for certo em < 6 meses, incluir já.                                                                                                                      |
| DP-06 | Líder pode ver setlists/treinos dos músicos? | **Não**                                                            | Dado de estudo pessoal; alinhado ao `<database_schema>`.                                                                                                                                                          |
| DP-07 | Base da rolagem automática                   | **Duração do vídeo vinculado; fallback BPM × compassos estimados** | BPM sozinho não diz quanto tempo cada linha dura; a duração do vídeo dá uma velocidade inicial realista, com ajuste manual.                                                                                       |
| DP-08 | Ajustes no esquema de dados                  | **Aprovar** as mudanças do `architecture.md` §8                    | Separar músicas da escala (`schedule_songs`) das atribuições; `profiles.id = auth.users.id`.                                                                                                                      |
| DP-09 | Abas inferiores: 7 × 5                       | **5 abas** (Início, Escalas, Músicas, Setlists, Ajustes)           | 7 abas estouram as diretrizes de iOS/Material (≤ 5); Cifra e Treino são acessados a partir de uma música.                                                                                                         |
| DP-10 | Dono do repositório GitHub                   | —                                                                  | Placeholder `{{GITHUB_USERNAME_OU_ORG}}` precisa ser informado.                                                                                                                                                   |

## 9. Premissas

- Um único ministério/igreja por instalação do backend (até DP-05 mudar).
- Ministério de pequeno/médio porte (até ~100 membros, ~2.000 músicas).
- A igreja tem (ou providenciará) um projeto Supabase e um projeto Google Cloud para a YouTube Data API.
- Publicação nas lojas não faz parte das 14 fases (distribuição interna via EAS/TestFlight/Internal testing).
