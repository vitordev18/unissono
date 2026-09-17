-- Uníssono — Fase 2 · Caminho de bootstrap para o primeiro líder
--
-- O guarda de privilégio criado em 20260916000200_profiles.sql bloqueava até o
-- contexto administrativo: sem usuário autenticado, auth.uid() é nulo e
-- is_leader() retorna falso, então nem o seed nem o console SQL conseguiam
-- promover o primeiro líder do ministério (problema clássico de bootstrap).
--
-- A exceção vale apenas quando NÃO há usuário autenticado — service_role,
-- migrações, seed e console. O papel anon não alcança este trigger porque não
-- possui política de UPDATE em public.profiles.
--
-- Rollback: reaplicar a versão da função em 20260916000200_profiles.sql.

create or replace function public.enforce_profile_privilege_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_leader() then
    raise exception 'Somente um líder pode alterar papel ou situação de um membro'
      using errcode = '42501';
  end if;

  if old.role = 'lider'
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and (select count(*) from public.profiles p where p.role = 'lider' and p.is_active) <= 1 then
    raise exception 'O ministério precisa de pelo menos um líder ativo'
      using errcode = '23514';
  end if;

  return new;
end;
$fn$;

revoke execute on function public.enforce_profile_privilege_guard() from public, anon, authenticated;
