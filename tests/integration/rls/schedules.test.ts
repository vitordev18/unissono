import { hasSupabaseCredentials } from '../../support/env';
import { seedIds, signInAs, type TestClient } from '../../support/supabase-clients';

const describeRls = hasSupabaseCredentials ? describe : describe.skip;

describeRls('RLS · escalas de culto', () => {
  let lider: TestClient;
  let musico1: TestClient;

  beforeAll(async () => {
    [lider, musico1] = await Promise.all([signInAs('lider'), signInAs('musico1')]);
  }, 30_000);

  afterAll(async () => {
    await Promise.all([lider.auth.signOut(), musico1.auth.signOut()]);
  });

  it('líder enxerga rascunhos e publicadas', async () => {
    const { data, error } = await lider.from('service_schedules').select('id, status');

    expect(error).toBeNull();
    expect(data?.map((linha) => linha.id)).toEqual(
      expect.arrayContaining([seedIds.publishedSchedule, seedIds.draftSchedule]),
    );
  });

  it('músico enxerga apenas escalas publicadas', async () => {
    const { data, error } = await musico1.from('service_schedules').select('id, status');

    expect(error).toBeNull();

    const ids = data?.map((linha) => linha.id) ?? [];

    expect(ids).toContain(seedIds.publishedSchedule);
    expect(ids).not.toContain(seedIds.draftSchedule);
    expect(data?.every((linha) => linha.status === 'publicada')).toBe(true);
  });

  it('músico não vê músicas nem atribuições de escala em rascunho', async () => {
    const [musicas, atribuicoes] = await Promise.all([
      musico1.from('schedule_songs').select('id').eq('schedule_id', seedIds.draftSchedule),
      musico1.from('schedule_assignments').select('id').eq('schedule_id', seedIds.draftSchedule),
    ]);

    expect(musicas.data).toEqual([]);
    expect(atribuicoes.data).toEqual([]);
  });

  it('músico vê as músicas da escala publicada, com o tom do culto', async () => {
    const { data, error } = await musico1
      .from('schedule_songs')
      .select('position, key, song:songs(title, default_key)')
      .eq('schedule_id', seedIds.publishedSchedule)
      .order('position');

    expect(error).toBeNull();
    expect(data?.length).toBe(2);
    expect(data?.[0]?.key).toBe('A');
    // Tom nulo significa "usar o tom padrão da música".
    expect(data?.[1]?.key).toBeNull();
  });

  it('músico NÃO cria nem publica escala', async () => {
    const criacao = await musico1
      .from('service_schedules')
      .insert({ date: '2027-01-01', service_type: 'Tentativa indevida' });

    expect(criacao.error?.code).toBe('42501');

    const publicacao = await musico1
      .from('service_schedules')
      .update({ status: 'publicada' })
      .eq('id', seedIds.draftSchedule)
      .select();

    expect(publicacao.data).toEqual([]);
  });

  it('líder publica e volta a escala para rascunho', async () => {
    const publicar = await lider
      .from('service_schedules')
      .update({ status: 'publicada' })
      .eq('id', seedIds.draftSchedule)
      .select('status')
      .single();

    expect(publicar.error).toBeNull();
    expect(publicar.data?.status).toBe('publicada');

    const { data: visivelAgora } = await musico1
      .from('service_schedules')
      .select('id')
      .eq('id', seedIds.draftSchedule);

    expect(visivelAgora?.length).toBe(1);

    const reverter = await lider
      .from('service_schedules')
      .update({ status: 'rascunho' })
      .eq('id', seedIds.draftSchedule)
      .select('status')
      .single();

    expect(reverter.data?.status).toBe('rascunho');
  });
});
