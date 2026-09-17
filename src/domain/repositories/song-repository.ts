import type { NewSong, Song } from '../entities/song';

export interface SongFilter {
  /** Busca por título ou artista, sem acento e sem caixa. */
  term?: string;
  tags?: string[];
}

export interface SongRepository {
  search(filter: SongFilter): Promise<Song[]>;
  getById(id: string): Promise<Song>;
  create(input: NewSong): Promise<Song>;
}
