-- Uníssono — Fase 2 · Ajuste de políticas e índices de chave estrangeira
--
-- Apontado pelo advisor de performance do Supabase:
--
-- 1. Chaves estrangeiras sem índice de cobertura: toda exclusão de música ou
--    de perfil precisava varrer as tabelas filhas.
-- 2. Políticas permissivas múltiplas: uma política "for all" do líder somava-se
--    à política de leitura do membro, e o Postgres avaliava as duas em TODA
--    consulta. Agora cada tabela tem uma única política de SELECT e políticas
--    separadas de INSERT/UPDATE/DELETE para o líder.
--
-- O comportamento de permissão é idêntico ao anterior — a suíte de testes de
-- RLS passa sem alteração antes e depois desta migração.
--
-- Rollback: recriar as políticas "for all" das migrações 000200 a 000500 e
--   drop index songs_created_by_idx, song_charts_created_by_idx,
--   repertoires_created_by_idx, repertoire_songs_song_idx,
--   schedule_songs_song_idx, service_schedules_created_by_idx,
--   personal_setlist_songs_song_idx;

create index songs_created_by_idx on public.songs (created_by);
create index song_charts_created_by_idx on public.song_charts (created_by);
create index repertoires_created_by_idx on public.repertoires (created_by);
create index repertoire_songs_song_idx on public.repertoire_songs (song_id);
create index schedule_songs_song_idx on public.schedule_songs (song_id);
create index service_schedules_created_by_idx on public.service_schedules (created_by);
create index personal_setlist_songs_song_idx on public.personal_setlist_songs (song_id);

drop policy "membro edita o proprio perfil" on public.profiles;
drop policy "lider edita qualquer perfil" on public.profiles;

create policy "atualizacao de perfil"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_leader())
  with check (id = (select auth.uid()) or public.is_leader());

drop policy "membros ativos leem musicas" on public.songs;
drop policy "lider gerencia musicas" on public.songs;

create policy "leitura de musicas"
  on public.songs for select to authenticated
  using (public.is_active_member());

create policy "lider insere musicas"
  on public.songs for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza musicas"
  on public.songs for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove musicas"
  on public.songs for delete to authenticated
  using (public.is_leader());

drop policy "membros ativos leem cifras" on public.song_charts;
drop policy "lider gerencia cifras" on public.song_charts;

create policy "leitura de cifras"
  on public.song_charts for select to authenticated
  using (public.is_active_member());

create policy "lider insere cifras"
  on public.song_charts for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza cifras"
  on public.song_charts for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove cifras"
  on public.song_charts for delete to authenticated
  using (public.is_leader());

drop policy "membros ativos leem repertorios" on public.repertoires;
drop policy "lider gerencia repertorios" on public.repertoires;

create policy "leitura de repertorios"
  on public.repertoires for select to authenticated
  using (public.is_active_member());

create policy "lider insere repertorios"
  on public.repertoires for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza repertorios"
  on public.repertoires for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove repertorios"
  on public.repertoires for delete to authenticated
  using (public.is_leader());

drop policy "membros ativos leem musicas do repertorio" on public.repertoire_songs;
drop policy "lider gerencia musicas do repertorio" on public.repertoire_songs;

create policy "leitura de musicas do repertorio"
  on public.repertoire_songs for select to authenticated
  using (public.is_active_member());

create policy "lider insere musicas no repertorio"
  on public.repertoire_songs for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza musicas do repertorio"
  on public.repertoire_songs for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove musicas do repertorio"
  on public.repertoire_songs for delete to authenticated
  using (public.is_leader());

drop policy "lider le todas as escalas" on public.service_schedules;
drop policy "musico le escalas publicadas" on public.service_schedules;
drop policy "lider gerencia escalas" on public.service_schedules;

create policy "leitura de escalas"
  on public.service_schedules for select to authenticated
  using (
    public.is_leader()
    or (public.is_active_member() and status = 'publicada')
  );

create policy "lider insere escalas"
  on public.service_schedules for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza escalas"
  on public.service_schedules for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove escalas"
  on public.service_schedules for delete to authenticated
  using (public.is_leader());

drop policy "lider le musicas de qualquer escala" on public.schedule_songs;
drop policy "musico le musicas de escala publicada" on public.schedule_songs;
drop policy "lider gerencia musicas da escala" on public.schedule_songs;

create policy "leitura de musicas da escala"
  on public.schedule_songs for select to authenticated
  using (
    public.is_leader()
    or (
      public.is_active_member()
      and exists (
        select 1 from public.service_schedules s
        where s.id = schedule_id and s.status = 'publicada'
      )
    )
  );

create policy "lider insere musicas na escala"
  on public.schedule_songs for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza musicas da escala"
  on public.schedule_songs for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove musicas da escala"
  on public.schedule_songs for delete to authenticated
  using (public.is_leader());

drop policy "lider le todas as atribuicoes" on public.schedule_assignments;
drop policy "musico le atribuicoes de escala publicada" on public.schedule_assignments;
drop policy "lider gerencia atribuicoes" on public.schedule_assignments;

create policy "leitura de atribuicoes"
  on public.schedule_assignments for select to authenticated
  using (
    public.is_leader()
    or (
      public.is_active_member()
      and exists (
        select 1 from public.service_schedules s
        where s.id = schedule_id and s.status = 'publicada'
      )
    )
  );

create policy "lider insere atribuicoes"
  on public.schedule_assignments for insert to authenticated
  with check (public.is_leader());

create policy "lider atualiza atribuicoes"
  on public.schedule_assignments for update to authenticated
  using (public.is_leader()) with check (public.is_leader());

create policy "lider remove atribuicoes"
  on public.schedule_assignments for delete to authenticated
  using (public.is_leader());
