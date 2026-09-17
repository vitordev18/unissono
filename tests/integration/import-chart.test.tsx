import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { ImportChartScreen } from '@/features/cifras/screens/import-chart-screen';
import type { SongChartRepository } from '@/domain/repositories/song-chart-repository';

import { createFakeSongChartRepository, musicaDeTeste } from '../support/fakes';
import { renderWithProviders } from '../support/render';

const mockParametros = { id: musicaDeTeste.id };
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => mockParametros,
}));

const CIFRA_COLADA = `Tom: G

Verso 1:
G                D
Primeira linha da letra`;

describe('ImportChartScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('exige texto antes de continuar', async () => {
    await renderWithProviders(<ImportChartScreen />);

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('pré-visualiza a cifra colada e salva como nova versão', async () => {
    const charts: SongChartRepository = createFakeSongChartRepository();
    const espiao = jest.spyOn(charts, 'create');
    const usuario = userEvent.setup();

    await renderWithProviders(<ImportChartScreen />, { charts });

    await usuario.type(screen.getByLabelText('Cifra'), CIFRA_COLADA);
    await usuario.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Pré-visualização')).toBeOnTheScreen();
    expect(screen.getByText('Tom identificado: G')).toBeOnTheScreen();
    expect(screen.getByText('Primeira linha da')).toBeOnTheScreen();

    await usuario.press(screen.getByRole('button', { name: 'Salvar cifra' }));

    await waitFor(() => {
      expect(espiao).toHaveBeenCalledTimes(1);
    });

    const salvo = espiao.mock.calls[0]?.[0];

    // O texto colado é convertido para ChordPro antes de ir para o banco.
    expect(salvo?.key).toBe('G');
    expect(salvo?.contentChordPro).toContain('{key: G}');
    expect(salvo?.contentChordPro).toContain('[G]Primeira linha da[D] letra');
    expect(mockReplace).toHaveBeenCalledWith(`/musicas/${musicaDeTeste.id}/cifra`);
  });

  it('avisa quando não reconhece nenhum acorde', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ImportChartScreen />);

    await usuario.type(screen.getByLabelText('Cifra'), 'Apenas uma letra sem acordes');
    await usuario.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('Nenhum acorde reconhecido — confira se o formato está correto.'),
    ).toBeOnTheScreen();
  });

  it('numera a nova versão a partir da anterior', async () => {
    const charts = createFakeSongChartRepository();
    const usuario = userEvent.setup();

    await renderWithProviders(<ImportChartScreen />, { charts });

    await usuario.type(screen.getByLabelText('Cifra'), CIFRA_COLADA);
    await usuario.press(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByText('Pré-visualização');
    await usuario.press(screen.getByRole('button', { name: 'Salvar cifra' }));

    await waitFor(async () => {
      const ultima = await charts.getLatest(musicaDeTeste.id);

      expect(ultima?.version).toBe(2);
    });
  });
});

describe('ImportChartScreen no modo editar', () => {
  it('abre com a versão atual carregada e salva como versão nova', async () => {
    const charts = createFakeSongChartRepository();
    const espiao = jest.spyOn(charts, 'create');
    const usuario = userEvent.setup();

    await renderWithProviders(<ImportChartScreen modo="editar" />, { charts });

    expect(await screen.findByText('Editar cifra')).toBeOnTheScreen();

    // O texto do rodapé só sabe a próxima versão depois que a cifra carrega.
    expect(
      await screen.findByText(
        'Ao salvar, esta edição vira a versão 2. A versão anterior continua guardada.',
      ),
    ).toBeOnTheScreen();
    expect(await screen.findByDisplayValue(/{key: G}/)).toBeOnTheScreen();

    await usuario.press(screen.getByRole('button', { name: 'Continuar' }));
    await screen.findByText('Pré-visualização');
    await usuario.press(screen.getByRole('button', { name: 'Salvar nova versão' }));

    await waitFor(() => {
      expect(espiao).toHaveBeenCalledTimes(1);
    });

    const versoes = await charts.listVersions(musicaDeTeste.id);

    // A versão anterior continua no histórico.
    expect(versoes.map((versao) => versao.version)).toEqual([2, 1]);
  });
});
