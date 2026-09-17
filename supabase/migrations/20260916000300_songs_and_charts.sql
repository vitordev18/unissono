-- Uníssono — Fase 2 · Catálogo de músicas e cifras versionadas
--
-- Rollback:
--   drop table if exists public.song_charts cascade;
--   drop function if exists public.set_song_chart_version();
--   drop table if exists public.songs cascade;

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  artist text check (artist is null or char_length(btrim(artist)) between 1 and 200),
  default_key public.musical_key,
  bpm smallint check (bpm is null or bpm between 20 and 300),
  tags text[] not null default '{}',
  youtube_url text check (
    youtube_url is null
    or youtube_url ~ '^https://(www\.youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  ),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Busca sem acento: coluna gerada + índice trigram (evita varredura completa).
  search_text text generated always as (
    public.immutable_unaccent(lower(coalesce(title, '') || ' ' || coalesce(artist, '')))
  ) stored
);

comment on table public.songs is 'Repertório geral da igreja. Conteúdo sempre inserido pelo próprio ministério.';

create index songs_search_idx on public.songs using gin (search_text extensions.gin_trgm_ops);
create index songs_tags_idx on public.songs using gin (tags);
create index songs_title_idx on public.songs (title);

create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

create table public.song_charts (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs (id) on delete cascade,
  content_chordpro text not null check (char_length(content_chordpro) between 1 and 200000),
  key public.musical_key not null,
  version integer not null check (version > 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (song_id, version)
);

comment on table public.song_charts is 'Cifras em ChordPro, versionadas por música. Versões antigas nunca são sobrescritas.';

create index song_charts_song_version_idx on public.song_charts (song_id, version desc);

-- A versão é atribuída pelo banco: dois líderes salvando ao mesmo tempo não
-- podem gerar a mesma versão (a unique (song_id, version) é a rede de proteção).
create or replace function public.set_song_chart_version()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  if new.version is null then
    select coalesce(max(c.version), 0) + 1
      into new.version
      from public.song_charts c
     where c.song_id = new.song_id;
  end if;

  return new;
end;
$fn$;

create trigger song_charts_set_version
  before insert on public.song_charts
  for each row execute function public.set_song_chart_version();

alter table public.songs enable row level security;
alter table public.song_charts enable row level security;

create policy "membros ativos leem musicas"
  on public.songs for select
  to authenticated
  using (public.is_active_member());

create policy "lider gerencia musicas"
  on public.songs for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

create policy "membros ativos leem cifras"
  on public.song_charts for select
  to authenticated
  using (public.is_active_member());

create policy "lider gerencia cifras"
  on public.song_charts for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

revoke all on public.songs from anon;
revoke all on public.song_charts from anon;
