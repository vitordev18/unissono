-- Uníssono — Fase 4/5 · Membro novo nasce inativo
--
-- Defesa em profundidade sobre o cadastro público (que também foi desativado no
-- painel do Supabase): mesmo que alguém consiga criar uma conta, o perfil nasce
-- inativo e não enxerga nada do ministério — is_active = false derruba
-- is_active_member() e, com ele, toda política de leitura.
--
-- Um líder precisa ativar o membro. A tela "Acesso desativado" (AuthGate) já
-- trata esse estado no app.
--
-- Esta migração registra no repositório uma alteração que foi feita direto no
-- banco; o SQL é idempotente.
--
-- Rollback:
--   alter table public.profiles alter column is_active set default true;

alter table public.profiles alter column is_active set default false;

comment on column public.profiles.is_active is
  'Nasce inativo: um lider precisa ativar o membro antes do acesso ao ministerio.';
