-- Uníssono — Fase 2 · Perfis dos membros do ministério
--
-- Rollback:
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop table if exists public.profiles cascade;
--   drop function if exists public.is_leader();
--   drop function if exists public.is_active_member();

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  role public.user_role not null default 'musico',
  instrument text check (instrument is null or char_length(btrim(instrument)) between 2 and 60),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Membros do ministério. id = auth.users.id (um único identificador).';
comment on column public.profiles.role is 'Alterável somente por líder — garantido pelo trigger enforce_profile_privilege_guard.';

create index profiles_role_idx on public.profiles (role) where is_active;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- security definer: lê public.profiles ignorando a RLS da própria tabela.
-- Sem isso, políticas que consultam profiles entrariam em recursão infinita.
create or replace function public.is_leader()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'lider'
      and p.is_active
  );
$fn$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
  );
$fn$;

revoke all on function public.is_leader() from anon;
revoke all on function public.is_active_member() from anon;

-- Cria o perfil a partir do usuário do Auth. O papel NUNCA vem dos metadados
-- enviados no cadastro: senão qualquer pessoa se cadastraria como líder.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  insert into public.profiles (id, name, instrument)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'instrument'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Barreira contra escalada de privilégio (risco R4 do plano de produto).
-- Uma política RLS não consegue comparar o valor antigo com o novo; um trigger sim.
create or replace function public.enforce_profile_privilege_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_leader() then
    raise exception 'Somente um líder pode alterar papel ou situação de um membro'
      using errcode = '42501';
  end if;

  -- O ministério nunca pode ficar sem líder ativo.
  if old.role = 'lider'
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and (select count(*) from public.profiles p where p.role = 'lider' and p.is_active) <= 1 then
    raise exception 'O ministério precisa de pelo menos um líder ativo'
      using errcode = '23514';
  end if;

  return new;
end;
$fn$;

create trigger profiles_privilege_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_privilege_guard();

alter table public.profiles enable row level security;

-- Leitura: qualquer membro ativo vê a lista do ministério; um membro
-- desativado ainda enxerga o próprio perfil (para exibir mensagem de bloqueio).
create policy "membros ativos leem perfis"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_active_member());

create policy "membro edita o proprio perfil"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "lider edita qualquer perfil"
  on public.profiles for update
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

-- INSERT e DELETE não têm política: perfis nascem pelo trigger on_auth_user_created
-- e são removidos em cascata quando o usuário do Auth é excluído.

revoke all on public.profiles from anon;
