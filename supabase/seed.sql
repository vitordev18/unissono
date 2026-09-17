-- Uníssono — Dados de desenvolvimento e teste
--
-- ⚠️ SOMENTE para o projeto Supabase de desenvolvimento. NUNCA rode em produção:
-- cria usuários com senha conhecida. As senhas abaixo são públicas por design,
-- pois este arquivo é versionado em repositório aberto.
--
-- Usuários criados (senha: Unissono!Teste123):
--   lider@unissono.test    → papel lider
--   musico1@unissono.test  → papel musico
--   musico2@unissono.test  → papel musico
--
-- Reexecutável: remove os usuários de teste antes de recriar (cascata apaga
-- perfis, setlists e sessões de treino).

delete from auth.users where email like '%@unissono.test';
delete from public.songs where title like 'Música de teste%';
delete from public.service_schedules where service_type like 'Teste%';
delete from public.repertoires where name like 'Repertório de teste%';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
  email_change, phone_change, phone_change_token, reauthentication_token
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
   'authenticated', 'authenticated', 'lider@unissono.test',
   extensions.crypt('Unissono!Teste123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Líder de Teste","instrument":"Violão"}', now(), now(), '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
   'authenticated', 'authenticated', 'musico1@unissono.test',
   extensions.crypt('Unissono!Teste123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Músico Um","instrument":"Teclado"}', now(), now(), '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333',
   'authenticated', 'authenticated', 'musico2@unissono.test',
   extensions.crypt('Unissono!Teste123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"name":"Músico Dois","instrument":"Baixo"}', now(), now(), '', '', '', '', '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(), now(), now()
from auth.users u
where u.email like '%@unissono.test';

-- O perfil nasce pelo trigger on_auth_user_created com papel 'musico'.
-- A promoção a líder é feita aqui, no papel de administrador do banco.
update public.profiles
   set role = 'lider'
 where id = '11111111-1111-4111-8111-111111111111';

insert into public.songs (id, title, artist, default_key, bpm, tags, youtube_url, created_by)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Música de teste A', 'Ministério de Teste', 'G', 72,
   array['adoração', 'ceia'], 'https://www.youtube.com/watch?v=ABCDEFGHIJK',
   '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Música de teste B', 'Ministério de Teste', 'D', 128,
   array['celebração'], null, '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Música de teste C — Coração', 'Outro Ministério', 'Bb', 90,
   array['adoração'], null, '11111111-1111-4111-8111-111111111111');

insert into public.song_charts (song_id, content_chordpro, key, created_by)
values
  ('aaaaaaaa-0000-4000-8000-000000000001',
   '{title: Música de teste A}
{key: G}
{start_of_verse}
[G]Primeira linha de [D]exemplo
[Em]Segunda linha de [C]exemplo
{end_of_verse}',
   'G', '11111111-1111-4111-8111-111111111111');

insert into public.service_schedules (id, date, service_type, status, created_by)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', current_date + 3, 'Teste — Culto publicado', 'publicada',
   '11111111-1111-4111-8111-111111111111'),
  ('bbbbbbbb-0000-4000-8000-000000000002', current_date + 10, 'Teste — Culto rascunho', 'rascunho',
   '11111111-1111-4111-8111-111111111111');

insert into public.schedule_songs (schedule_id, song_id, key, position)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'A', 0),
  ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000002', null, 1),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000003', 'Bb', 0);

insert into public.schedule_assignments (schedule_id, profile_id, instrument_role)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Ministração'),
  ('bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Teclado'),
  ('bbbbbbbb-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 'Baixo');

insert into public.repertoires (id, name, description, created_by)
values ('cccccccc-0000-4000-8000-000000000001', 'Repertório de teste — Ceia',
        'Músicas usadas no momento da ceia.', '11111111-1111-4111-8111-111111111111');

insert into public.repertoire_songs (repertoire_id, song_id, position)
values
  ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 0),
  ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000003', 1);
