import type { VideoSearchResult } from '../entities/video';

/**
 * Adapter sobre a YouTube Data API. O app nunca fala com o Google direto:
 * a chave mora na Edge Function (ver supabase/functions/youtube-search).
 */
export interface VideoSearchRepository {
  search(termo: string): Promise<VideoSearchResult[]>;
}
