import { AuthError } from '../entities/errors';
import type { VideoSearchResult } from '../entities/video';
import type { VideoSearchRepository } from '../repositories/video-search-repository';

export type SearchVideos = (termo: string) => Promise<VideoSearchResult[]>;

export function createSearchVideos(deps: { videos: VideoSearchRepository }): SearchVideos {
  return async function searchVideos(termo) {
    const limpo = termo.trim();

    if (limpo.length === 0) {
      throw new AuthError('dados-invalidos', 'Informe o que buscar.');
    }

    return deps.videos.search(limpo);
  };
}
