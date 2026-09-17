import type { Song } from '../entities/song';
import type { SongFilter, SongRepository } from '../repositories/song-repository';

export type SearchSongs = (filter: SongFilter) => Promise<Song[]>;

export function createSearchSongs(deps: { songs: SongRepository }): SearchSongs {
  return async function searchSongs(filter) {
    const term = filter.term?.trim() ?? '';

    return deps.songs.search({
      ...(term.length > 0 ? { term } : {}),
      ...(filter.tags && filter.tags.length > 0 ? { tags: filter.tags } : {}),
    });
  };
}
