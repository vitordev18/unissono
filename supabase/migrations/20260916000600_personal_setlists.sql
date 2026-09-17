-- Uníssono — Fase 2 · Setlists pessoais (privadas, inclusive para o líder)
--
-- Rollback:
--   drop table if exists public.personal_setlist_songs cascade;
--   drop table if exists public.personal_setlists cascade;

create table public.personal_setlists (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_profile_id, name)
);

comment on table public.personal_setlists is 'Estudo pessoal do músico. Nem o líder enxerga (DP-06).';

create index personal_setlists_owner_idx on public.personal_setlists (owner_profile_id);

create trigger personal_setlists_set_updated_at
  before update on public.personal_setlists
  for each row execute function public.set_updated_at();

create table public.personal_setlist_songs (
  setlist_id uuid not null references public.personal_setlists (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (setlist_id, song_id),
  constraint personal_setlist_songs_position_key unique (setlist_id, position)
    deferrable initially deferred
);

alter table public.personal_setlists enable row level security;
alter table public.personal_setlist_songs enable row level security;

create policy "dono gerencia as proprias setlists"
  on public.personal_setlists for all
  to authenticated
  using (owner_profile_id = (select auth.uid()))
  with check (owner_profile_id = (select auth.uid()));

create policy "dono gerencia as musicas das proprias setlists"
  on public.personal_setlist_songs for all
  to authenticated
  using (
    exists (
      select 1
      from public.personal_setlists s
      where s.id = setlist_id
        and s.owner_profile_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.personal_setlists s
      where s.id = setlist_id
        and s.owner_profile_id = (select auth.uid())
    )
  );

revoke all on public.personal_setlists from anon;
revoke all on public.personal_setlist_songs from anon;
