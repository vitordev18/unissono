-- Uníssono — Fase 2 · Extensões, tipos e funções auxiliares
--
-- Rollback:
--   drop function if exists public.set_updated_at();
--   drop function if exists public.immutable_unaccent(text);
--   drop domain if exists public.musical_key;
--   drop type if exists public.schedule_status;
--   drop type if exists public.user_role;

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- Papéis do ministério. Deliberadamente fechado: qualquer papel novo exige
-- migração e revisão das políticas de RLS.
create type public.user_role as enum ('lider', 'musico');

create type public.schedule_status as enum ('rascunho', 'publicada', 'cancelada');

-- Tom musical: nota (A-G), acidente opcional (# ou b) e sufixo 'm' para menor.
create domain public.musical_key as text check (value ~ '^[A-G](#|b)?m?$');

-- unaccent() é STABLE; um índice de expressão exige IMMUTABLE.
create or replace function public.immutable_unaccent(input text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $fn$
  select extensions.unaccent('extensions.unaccent', input)
$fn$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

revoke all on function public.immutable_unaccent(text) from anon;
