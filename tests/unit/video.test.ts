import { AuthError } from '@/domain/entities/errors';
import { formatDuration, videoIdFromUrl, videoUrl } from '@/domain/entities/video';
import { createLinkVideo, createUnlinkVideo } from '@/domain/use-cases/link-video';
import { createSearchVideos } from '@/domain/use-cases/search-videos';

import {
  createFakeSongRepository,
  createFakeVideoSearchRepository,
  musicaDeTeste,
  videoDeTeste,
} from '../support/fakes';

describe('videoIdFromUrl', () => {
  it('extrai o id das formas aceitas de URL', () => {
    expect(videoIdFromUrl('https://www.youtube.com/watch?v=ABCDEFGHIJK')).toBe('ABCDEFGHIJK');
    expect(videoIdFromUrl('https://youtu.be/ABCDEFGHIJK')).toBe('ABCDEFGHIJK');
    expect(videoIdFromUrl('https://www.youtube.com/watch?v=ABCDEFGHIJK&t=30s')).toBe('ABCDEFGHIJK');
  });

  it('devolve null sem vídeo vinculado ou com URL estranha', () => {
    expect(videoIdFromUrl(null)).toBeNull();
    expect(videoIdFromUrl('https://exemplo.com/video')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('mostra a duração como no player', () => {
    expect(formatDuration(250)).toBe('4:10');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(0)).toBe('0:00');
  });
});

describe('createSearchVideos', () => {
  it('recusa busca vazia antes de gastar cota', async () => {
    const videos = createFakeVideoSearchRepository();
    const espiao = jest.spyOn(videos, 'search');
    const searchVideos = createSearchVideos({ videos });

    await expect(searchVideos('   ')).rejects.toThrow(AuthError);
    expect(espiao).not.toHaveBeenCalled();
  });

  it('devolve os vídeos encontrados', async () => {
    const searchVideos = createSearchVideos({ videos: createFakeVideoSearchRepository() });

    await expect(searchVideos('música de teste')).resolves.toEqual([videoDeTeste]);
  });
});

describe('createLinkVideo', () => {
  it('grava a URL do vídeo na música', async () => {
    const songs = createFakeSongRepository();
    const linkVideo = createLinkVideo({ songs });

    const atualizada = await linkVideo({
      songId: musicaDeTeste.id,
      videoId: videoDeTeste.videoId,
    });

    expect(atualizada.youtubeUrl).toBe(videoUrl(videoDeTeste.videoId));
  });

  it('recusa identificador de vídeo inválido', async () => {
    const songs = createFakeSongRepository();
    const espiao = jest.spyOn(songs, 'setYoutubeUrl');
    const linkVideo = createLinkVideo({ songs });

    await expect(
      // 11 caracteres válidos é o formato do YouTube; 'curto' não passa.
      linkVideo({ songId: musicaDeTeste.id, videoId: 'curto' }),
    ).rejects.toThrow('Identificador de vídeo inválido.');
    expect(espiao).not.toHaveBeenCalled();
  });

  it('desvincula o vídeo', async () => {
    const songs = createFakeSongRepository();
    const linkVideo = createLinkVideo({ songs });
    const unlinkVideo = createUnlinkVideo({ songs });

    await linkVideo({ songId: musicaDeTeste.id, videoId: videoDeTeste.videoId });
    const semVideo = await unlinkVideo(musicaDeTeste.id);

    expect(semVideo.youtubeUrl).toBeNull();
  });
});
