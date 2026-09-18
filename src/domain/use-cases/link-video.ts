import { AuthError } from '../entities/errors';
import type { Song } from '../entities/song';
import { videoIdSchema, videoUrl } from '../entities/video';
import type { SongRepository } from '../repositories/song-repository';

export type LinkVideo = (input: { songId: string; videoId: string }) => Promise<Song>;

export function createLinkVideo(deps: { songs: SongRepository }): LinkVideo {
  return async function linkVideo({ songId, videoId }) {
    const validacao = videoIdSchema.safeParse(videoId);

    if (!validacao.success) {
      throw new AuthError('dados-invalidos', 'Identificador de vídeo inválido.');
    }

    return deps.songs.setYoutubeUrl(songId, videoUrl(validacao.data));
  };
}

export type UnlinkVideo = (songId: string) => Promise<Song>;

export function createUnlinkVideo(deps: { songs: SongRepository }): UnlinkVideo {
  return async function unlinkVideo(songId) {
    return deps.songs.setYoutubeUrl(songId, null);
  };
}
