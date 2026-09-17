-- Uníssono — Fase 2 · Endurecimento das permissões de execução de funções
--
-- O advisor de segurança do Supabase apontou que funções SECURITY DEFINER
-- ficam expostas em /rest/v1/rpc/<funcao> porque o PostgreSQL concede EXECUTE
-- a PUBLIC por padrão — e "revoke ... from anon" não desfaz a concessão a PUBLIC.
--
-- Funções de trigger não precisam de EXECUTE para nenhum cliente: a permissão
-- é verificada na criação do trigger, não a cada disparo.
--
-- is_leader() e is_active_member() continuam executáveis por usuários
-- autenticados porque as políticas de RLS são avaliadas com os privilégios de
-- quem consulta. Elas respondem apenas sobre o próprio chamador.
--
-- Rollback:
--   grant execute on function public.handle_new_user() to public;
--   grant execute on function public.enforce_profile_privilege_guard() to public;
--   grant execute on function public.set_updated_at() to public;
--   grant execute on function public.set_song_chart_version() to public;
--   grant execute on function public.is_leader() to public;
--   grant execute on function public.is_active_member() to public;
--   grant execute on function public.immutable_unaccent(text) to public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_profile_privilege_guard() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.set_song_chart_version() from public, anon, authenticated;

revoke execute on function public.is_leader() from public, anon;
grant execute on function public.is_leader() to authenticated;

revoke execute on function public.is_active_member() from public, anon;
grant execute on function public.is_active_member() to authenticated;

revoke execute on function public.immutable_unaccent(text) from public, anon;
grant execute on function public.immutable_unaccent(text) to authenticated;
