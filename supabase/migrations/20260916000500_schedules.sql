-- Uníssono — Fase 2 · Escalas de culto, músicas da escala e atribuições
--
-- Rollback:
--   alter publication supabase_realtime drop table public.schedule_assignments;
--   alter publication supabase_realtime drop table public.schedule_songs;
--   alter publication supabase_realtime drop table public.service_schedules;
--   drop table if exists public.schedule_assignments cascade;
--   drop table if exists public.schedule_songs cascade;
--   drop table if exists public.service_schedules cascade;

create table public.service_schedules (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  service_type text not null check (char_length(btrim(service_type)) between 2 and 60),
  status public.schedule_status not null default 'rascunho',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, service_type)
);

comment on table public.service_schedules is 'Músicos só enxergam escalas com status publicada.';

create index service_schedules_date_idx on public.service_schedules (date desc);

create trigger service_schedules_set_updated_at
  before update on public.service_schedules
  for each row execute function public.set_updated_at();

-- Músicas do culto: tabela separada das atribuições (ver ADR-004). Com song_id
-- dentro de schedule_assignments, a lista de músicas se repetiria por músico.
create table public.schedule_songs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.service_schedules (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete restrict,
  key public.musical_key,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (schedule_id, song_id),
  constraint schedule_songs_position_key unique (schedule_id, position)
    deferrable initially deferred
);

comment on column public.schedule_songs.key is 'Tom do culto. Nulo significa usar songs.default_key.';

create index schedule_songs_schedule_idx on public.schedule_songs (schedule_id, position);

create table public.schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.service_schedules (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  instrument_role text not null check (char_length(btrim(instrument_role)) between 2 and 60),
  created_at timestamptz not null default now(),
  unique (schedule_id, profile_id, instrument_role)
);

create index schedule_assignments_profile_idx on public.schedule_assignments (profile_id);
create index schedule_assignments_schedule_idx on public.schedule_assignments (schedule_id);

alter table public.service_schedules enable row level security;
alter table public.schedule_songs enable row level security;
alter table public.schedule_assignments enable row level security;

create policy "lider le todas as escalas"
  on public.service_schedules for select
  to authenticated
  using (public.is_leader());

create policy "musico le escalas publicadas"
  on public.service_schedules for select
  to authenticated
  using (public.is_active_member() and status = 'publicada');

create policy "lider gerencia escalas"
  on public.service_schedules for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

create policy "lider le musicas de qualquer escala"
  on public.schedule_songs for select
  to authenticated
  using (public.is_leader());

create policy "musico le musicas de escala publicada"
  on public.schedule_songs for select
  to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1
      from public.service_schedules s
      where s.id = schedule_id
        and s.status = 'publicada'
    )
  );

create policy "lider gerencia musicas da escala"
  on public.schedule_songs for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

create policy "lider le todas as atribuicoes"
  on public.schedule_assignments for select
  to authenticated
  using (public.is_leader());

create policy "musico le atribuicoes de escala publicada"
  on public.schedule_assignments for select
  to authenticated
  using (
    public.is_active_member()
    and exists (
      select 1
      from public.service_schedules s
      where s.id = schedule_id
        and s.status = 'publicada'
    )
  );

create policy "lider gerencia atribuicoes"
  on public.schedule_assignments for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

revoke all on public.service_schedules from anon;
revoke all on public.schedule_songs from anon;
revoke all on public.schedule_assignments from anon;

-- Realtime (padrão Observer da arquitetura): o evento apenas invalida o cache
-- do cliente; a leitura continua passando pela RLS acima.
alter publication supabase_realtime add table public.service_schedules;
alter publication supabase_realtime add table public.schedule_songs;
alter publication supabase_realtime add table public.schedule_assignments;
