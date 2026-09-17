-- Uníssono — Fase 2 · Ambiente de treino (loop A-B, velocidade e anotações)
--
-- Rollback:
--   drop table if exists public.rehearsal_sessions cascade;

create table public.rehearsal_sessions (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  notes text check (notes is null or char_length(notes) <= 10000),
  loop_start numeric(8, 2) check (loop_start is null or loop_start >= 0),
  loop_end numeric(8, 2) check (loop_end is null or loop_end >= 0),
  playback_speed numeric(3, 2) not null default 1.00
    check (playback_speed between 0.25 and 2.00),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (song_id, profile_id),
  constraint rehearsal_sessions_loop_order check (
    loop_start is null or loop_end is null or loop_start < loop_end
  )
);

comment on table public.rehearsal_sessions is 'Anotações e marcações privadas de cada músico por música.';
comment on column public.rehearsal_sessions.playback_speed is 'Faixa suportada pelo player do YouTube: 0,25x a 2x.';

create index rehearsal_sessions_profile_idx on public.rehearsal_sessions (profile_id, updated_at desc);

create trigger rehearsal_sessions_set_updated_at
  before update on public.rehearsal_sessions
  for each row execute function public.set_updated_at();

alter table public.rehearsal_sessions enable row level security;

create policy "dono gerencia as proprias sessoes de treino"
  on public.rehearsal_sessions for all
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

revoke all on public.rehearsal_sessions from anon;
