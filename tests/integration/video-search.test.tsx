import { screen, userEvent, waitFor } from '@testing-library/react-native';

import type { SongRepository } from '@/domain/repositories/song-repository';
import type { VideoSearchRepository } from '@/domain/repositories/video-search-repository';
import { VideoSearchScreen } from '@/features/youtube/screens/video-search-screen';

import {
  createFakeSongRepository,
  createFakeVideoSearchRepository,
  musicaDeTeste,
  videoDeTeste,
} from '../support/fakes';
import { renderWithProviders } from '../support/render';

const mockParametros = { id: musicaDeTeste.id };
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => mockParametros,
}));

describe('VideoSearchScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('já sugere o título e o artista da música na busca', async () => {
    await renderWithProviders(<VideoSearchScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText('Buscar vídeo')).toHaveDisplayValue(
        'Música de teste A Ministério de Teste',
      );
    });
  });

  it('só busca quando o líder manda, e mostra os resultados', async () => {
    const videos = createFakeVideoSearchRepository();
    const espiao = jest.spyOn(videos, 'search');
    const usuario = userEvent.setup();

    await renderWithProviders(<VideoSearchScreen />, { videos });

    // Nada de buscar a cada tecla: cada consulta custa 100 unidades de cota.
    expect(espiao).not.toHaveBeenCalled();

    await usuario.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Música de teste A (ao vivo)')).toBeOnTheScreen();
    expect(screen.getByText('Canal de Teste · 4:10')).toBeOnTheScreen();
    expect(espiao).toHaveBeenCalledTimes(1);
  });

  it('vincula o vídeo escolhido e volta para a música', async () => {
    const songs: SongRepository = createFakeSongRepository();
    const espiao = jest.spyOn(songs, 'setYoutubeUrl');
    const usuario = userEvent.setup();

    await renderWithProviders(<VideoSearchScreen />, { songs });

    await usuario.press(screen.getByRole('button', { name: 'Buscar' }));
    await usuario.press(await screen.findByLabelText('Música de teste A (ao vivo)'));
    await usuario.press(screen.getByRole('button', { name: 'Vincular vídeo selecionado' }));

    await waitFor(() => {
      expect(espiao).toHaveBeenCalledWith(
        musicaDeTeste.id,
        `https://www.youtube.com/watch?v=${videoDeTeste.videoId}`,
      );
    });
    expect(mockBack).toHaveBeenCalled();
  });

  it('exige escolher um vídeo antes de vincular', async () => {
    await renderWithProviders(<VideoSearchScreen />);

    expect(screen.getByRole('button', { name: 'Vincular vídeo selecionado' })).toBeDisabled();
  });

  it('mostra a mensagem de cota estourada vinda da Edge Function', async () => {
    const videos: VideoSearchRepository = {
      search: () => Promise.reject(new Error('Limite diário de buscas atingido. Tente amanhã.')),
    };
    const usuario = userEvent.setup();

    await renderWithProviders(<VideoSearchScreen />, { videos });

    await usuario.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByText('Limite diário de buscas atingido. Tente amanhã.'),
    ).toBeOnTheScreen();
  });
});
