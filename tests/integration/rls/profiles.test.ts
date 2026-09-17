import { hasSupabaseCredentials } from '../../support/env';
import { signInAs, testAccounts, type TestClient } from '../../support/supabase-clients';

const describeRls = hasSupabaseCredentials ? describe : describe.skip;

describeRls('RLS · profiles', () => {
  let lider: TestClient;
  let musico1: TestClient;

  beforeAll(async () => {
    [lider, musico1] = await Promise.all([signInAs('lider'), signInAs('musico1')]);
  }, 30_000);

  afterAll(async () => {
    await Promise.all([lider.auth.signOut(), musico1.auth.signOut()]);
  });

  it('músico lê a lista de membros do ministério', async () => {
    const { data, error } = await musico1.from('profiles').select('id, name, role');

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(3);
  });

  it('músico edita o próprio nome', async () => {
    const novoNome = `Músico Um ${Date.now().toString().slice(-4)}`;

    const { error } = await musico1
      .from('profiles')
      .update({ name: novoNome })
      .eq('id', testAccounts.musico1.id);

    expect(error).toBeNull();

    await musico1.from('profiles').update({ name: 'Músico Um' }).eq('id', testAccounts.musico1.id);
  });

  it('músico NÃO consegue se promover a líder', async () => {
    const { error } = await musico1
      .from('profiles')
      .update({ role: 'lider' })
      .eq('id', testAccounts.musico1.id);

    expect(error).not.toBeNull();
    expect(error?.message).toContain('Somente um líder');

    const { data } = await musico1
      .from('profiles')
      .select('role')
      .eq('id', testAccounts.musico1.id)
      .single();

    expect(data?.role).toBe('musico');
  });

  it('músico NÃO consegue editar o perfil de outro membro', async () => {
    const { data } = await musico1
      .from('profiles')
      .update({ name: 'Nome invadido' })
      .eq('id', testAccounts.musico2.id)
      .select();

    // A RLS não gera erro: simplesmente nenhuma linha é afetada.
    expect(data).toEqual([]);

    const { data: alvo } = await musico1
      .from('profiles')
      .select('name')
      .eq('id', testAccounts.musico2.id)
      .single();

    expect(alvo?.name).not.toBe('Nome invadido');
  });

  it('líder promove e rebaixa um músico', async () => {
    const promocao = await lider
      .from('profiles')
      .update({ role: 'lider' })
      .eq('id', testAccounts.musico2.id)
      .select('role')
      .single();

    expect(promocao.error).toBeNull();
    expect(promocao.data?.role).toBe('lider');

    const rebaixamento = await lider
      .from('profiles')
      .update({ role: 'musico' })
      .eq('id', testAccounts.musico2.id)
      .select('role')
      .single();

    expect(rebaixamento.error).toBeNull();
    expect(rebaixamento.data?.role).toBe('musico');
  });
});
