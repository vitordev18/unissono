import { hasSupabaseCredentials } from '../../support/env';
import { seedIds, signInAs, testAccounts, type TestClient } from '../../support/supabase-clients';

const describeRls = hasSupabaseCredentials ? describe : describe.skip;

describeRls('RLS · dados pessoais (setlists e treino)', () => {
  let lider: TestClient;
  let musico1: TestClient;
  let musico2: TestClient;
  let setlistId: string;

  beforeAll(async () => {
    [lider, musico1, musico2] = await Promise.all([
      signInAs('lider'),
      signInAs('musico1'),
      signInAs('musico2'),
    ]);

    const { data, error } = await musico1
      .from('personal_setlists')
      .insert({
        owner_profile_id: testAccounts.musico1.id,
        name: `Estudo ${Date.now().toString()}`,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Não foi possível criar a setlist de teste: ${error.message}`);
    }

    setlistId = data.id;
  }, 30_000);

  afterAll(async () => {
    await musico1.from('personal_setlists').delete().eq('id', setlistId);
    await musico1.from('rehearsal_sessions').delete().eq('profile_id', testAccounts.musico1.id);
    await Promise.all([lider.auth.signOut(), musico1.auth.signOut(), musico2.auth.signOut()]);
  });

  it('dono lê a própria setlist', async () => {
    const { data, error } = await musico1
      .from('personal_setlists')
      .select('id')
      .eq('id', setlistId);

    expect(error).toBeNull();
    expect(data?.length).toBe(1);
  });

  it('outro músico NÃO enxerga a setlist alheia', async () => {
    const { data } = await musico2.from('personal_setlists').select('id').eq('id', setlistId);

    expect(data).toEqual([]);
  });

  it('nem o líder enxerga a setlist de um músico', async () => {
    const { data } = await lider.from('personal_setlists').select('id').eq('id', setlistId);

    expect(data).toEqual([]);
  });

  it('músico NÃO cria setlist em nome de outro', async () => {
    const { error } = await musico2
      .from('personal_setlists')
      .insert({ owner_profile_id: testAccounts.musico1.id, name: 'Setlist forjada' });

    expect(error?.code).toBe('42501');
  });

  it('dono adiciona música à própria setlist e outro músico não consegue ler', async () => {
    const insercao = await musico1
      .from('personal_setlist_songs')
      .insert({ setlist_id: setlistId, song_id: seedIds.songA, position: 0 });

    expect(insercao.error).toBeNull();

    const leituraAlheia = await musico2
      .from('personal_setlist_songs')
      .select('song_id')
      .eq('setlist_id', setlistId);

    expect(leituraAlheia.data).toEqual([]);
  });

  it('sessão de treino é privada do músico', async () => {
    const criacao = await musico1
      .from('rehearsal_sessions')
      .insert({
        song_id: seedIds.songA,
        profile_id: testAccounts.musico1.id,
        notes: 'Entrada só com baixo nos dois primeiros compassos.',
        loop_start: 72.5,
        loop_end: 100.0,
        playback_speed: 0.75,
      })
      .select('id')
      .single();

    expect(criacao.error).toBeNull();

    const leituraDoLider = await lider
      .from('rehearsal_sessions')
      .select('notes')
      .eq('song_id', seedIds.songA);

    expect(leituraDoLider.data).toEqual([]);
  });

  it('o banco recusa velocidade fora da faixa e loop invertido', async () => {
    const sessao = await musico1
      .from('rehearsal_sessions')
      .select('id')
      .eq('profile_id', testAccounts.musico1.id)
      .limit(1)
      .single();

    const id = sessao.data?.id ?? '';

    const velocidadeInvalida = await musico1
      .from('rehearsal_sessions')
      .update({ playback_speed: 3 })
      .eq('id', id)
      .select();

    expect(velocidadeInvalida.error).not.toBeNull();

    const loopInvertido = await musico1
      .from('rehearsal_sessions')
      .update({ loop_start: 120, loop_end: 30 })
      .eq('id', id)
      .select();

    expect(loopInvertido.error).not.toBeNull();
  });
});
