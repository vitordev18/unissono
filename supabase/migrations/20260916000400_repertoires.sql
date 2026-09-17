-- Uníssono — Fase 2 · Repertórios temáticos
--
-- Rollback:
--   drop table if exists public.repertoire_songs cascade;
--   drop table if exists public.repertoires cascade;

create table public.repertoires (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 2 and 120),
  description text check (description is null or char_length(description) <= 1000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger repertoires_set_updated_at
  before update on public.repertoires
  for each row execute function public.set_updated_at();

create table public.repertoire_songs (
  repertoire_id uuid not null references public.repertoires (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (repertoire_id, song_id),
  -- deferrable: reordenar a lista inteira numa transação passa por estados
  -- temporariamente duplicados.
  constraint repertoire_songs_position_key unique (repertoire_id, position)
    deferrable initially deferred
);

comment on column public.repertoire_songs.position is 'Ordem manual dentro do repertório ("order" é palavra reservada em SQL).';

alter table public.repertoires enable row level security;
alter table public.repertoire_songs enable row level security;

create policy "membros ativos leem repertorios"
  on public.repertoires for select
  to authenticated
  using (public.is_active_member());

create policy "lider gerencia repertorios"
  on public.repertoires for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

create policy "membros ativos leem musicas do repertorio"
  on public.repertoire_songs for select
  to authenticated
  using (public.is_active_member());

create policy "lider gerencia musicas do repertorio"
  on public.repertoire_songs for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

revoke all on public.repertoires from anon;
revoke all on public.repertoire_songs from anon;
