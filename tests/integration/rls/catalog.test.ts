import { hasSupabaseCredentials } from '../../support/env';
import { seedIds, signInAs, type TestClient } from '../../support/supabase-clients';

const describeRls = hasSupabaseCredentials ? describe : describe.skip;

describeRls('RLS · catálogo (músicas, cifras e repertórios)', () => {
  let lider: TestClient;
  let musico1: TestClient;

  beforeAll(async () => {
    [lider, musico1] = await Promise.all([signInAs('lider'), signInAs('musico1')]);
  }, 30_000);

  afterAll(async () => {
    await Promise.all([lider.auth.signOut(), musico1.auth.signOut()]);
  });

  it('músico lê músicas, cifras e repertórios', async () => {
    const [songs, charts, repertoires] = await Promise.all([
      musico1.from('songs').select('id, title'),
      musico1.from('song_charts').select('id, version'),
      musico1.from('repertoires').select('id, name'),
    ]);

    expect(songs.error).toBeNull();
    expect(songs.data?.length).toBeGreaterThanOrEqual(3);
    expect(charts.error).toBeNull();
    expect(charts.data?.length).toBeGreaterThanOrEqual(1);
    expect(repertoires.error).toBeNull();
    expect(repertoires.data?.length).toBeGreaterThanOrEqual(1);
  });

  it('músico NÃO cria música', async () => {
    const { error } = await musico1.from('songs').insert({ title: 'Tentativa indevida' });

    expect(error).not.toBeNull();
    expect(error?.code).toBe('42501');
  });

  it('músico NÃO cria nem altera cifra', async () => {
    const insercao = await musico1.from('song_charts').insert({
      song_id: seedIds.songB,
      content_chordpro: '[C]Tentativa',
      key: 'C',
    });

    expect(insercao.error?.code).toBe('42501');

    const alteracao = await musico1
      .from('song_charts')
      .update({ content_chordpro: '[C]Alterado indevidamente' })
      .eq('song_id', seedIds.songA)
      .select();

    expect(alteracao.data).toEqual([]);
  });

  it('líder cria música e a remove em seguida', async () => {
    const criacao = await lider
      .from('songs')
      .insert({ title: 'Música temporária de teste', default_key: 'E', bpm: 100 })
      .select('id')
      .single();

    expect(criacao.error).toBeNull();

    const id = criacao.data?.id as string;
    const remocao = await lider.from('songs').delete().eq('id', id);

    expect(remocao.error).toBeNull();
  });

  it('a versão da cifra é atribuída pelo banco, em sequência', async () => {
    const primeira = await lider
      .from('song_charts')
      .insert({ song_id: seedIds.songB, content_chordpro: '[D]Versão um', key: 'D' })
      .select('version')
      .single();

    const segunda = await lider
      .from('song_charts')
      .insert({ song_id: seedIds.songB, content_chordpro: '[D]Versão dois', key: 'D' })
      .select('version, id')
      .single();

    expect(primeira.error).toBeNull();
    expect(segunda.error).toBeNull();
    expect(segunda.data?.version).toBe((primeira.data?.version as number) + 1);

    await lider.from('song_charts').delete().eq('song_id', seedIds.songB);
  });

  it('o tom precisa ser uma tonalidade válida', async () => {
    const { error } = await lider
      .from('songs')
      .insert({ title: 'Música com tom inválido', default_key: 'H#' });

    expect(error).not.toBeNull();
  });
});
