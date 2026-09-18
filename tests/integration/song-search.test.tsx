import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';

import type { Song } from '@/domain/entities/song';
import { SongSearchScreen } from '@/features/cifras/screens/song-search-screen';

import { createFakeSongRepository, musicaDeTeste } from '../support/fakes';
import { renderWithProviders } from '../support/render';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const outraMusica: Song = {
  id: 'aaaaaaaa-0000-4000-8000-000000000002',
  title: 'Coração adorador',
  artist: 'Outro Ministério',
  defaultKey: 'D',
  bpm: 128,
  tags: ['celebração'],
  youtubeUrl: null,
};

describe('SongSearchScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('lista o repertório e mostra tom, bpm e tags', async () => {
    await renderWithProviders(<SongSearchScreen />, {
      songs: createFakeSongRepository([musicaDeTeste, outraMusica]),
    });

    expect(await screen.findByText('Música de teste A')).toBeOnTheScreen();
    expect(screen.getByText('Ministério de Teste · G · 72 bpm')).toBeOnTheScreen();
    expect(screen.getByText('#adoração')).toBeOnTheScreen();
    expect(screen.getByText('Coração adorador')).toBeOnTheScreen();
  });

  it('filtra pelo termo digitado', async () => {
    await renderWithProviders(<SongSearchScreen />, {
      songs: createFakeSongRepository([musicaDeTeste, outraMusica]),
    });
    await screen.findByText('Música de teste A');

    // O que está em teste é o filtro, não a digitação tecla a tecla: uma única
    // mudança de texto tira a dependência de quão carregada está a máquina.
    await fireEvent.changeText(screen.getByLabelText('Buscar música'), 'coração');

    await waitFor(
      () => {
        expect(screen.queryByText('Música de teste A')).not.toBeOnTheScreen();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Coração adorador')).toBeOnTheScreen();
  });

  it('avisa quando a busca não encontra nada', async () => {
    await renderWithProviders(<SongSearchScreen />, {
      songs: createFakeSongRepository([musicaDeTeste]),
    });
    await screen.findByText('Música de teste A');

    await fireEvent.changeText(screen.getByLabelText('Buscar música'), 'inexistente');

    expect(
      await screen.findByText('Nenhuma música encontrada.', undefined, { timeout: 3000 }),
    ).toBeOnTheScreen();
  });

  it('abre a música escolhida', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<SongSearchScreen />, {
      songs: createFakeSongRepository([musicaDeTeste]),
    });

    await usuario.press(await screen.findByText('Música de teste A'));

    expect(mockPush).toHaveBeenCalledWith(`/musicas/${musicaDeTeste.id}`);
  });
});
