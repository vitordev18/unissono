import { createSupabaseAuthRepository } from '@/data/supabase/supabase-auth-repository';
import { createSupabaseProfileRepository } from '@/data/supabase/supabase-profile-repository';
import { createSupabaseSongChartRepository } from '@/data/supabase/supabase-song-chart-repository';
import { createSupabaseSongRepository } from '@/data/supabase/supabase-song-repository';
import { createYouTubeSearchAdapter } from '@/data/youtube/youtube-search-adapter';
import { createSupabaseClient, type ClientOptions } from '@/data/supabase/client';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';
import type { SongChartRepository } from '@/domain/repositories/song-chart-repository';
import type { SongRepository } from '@/domain/repositories/song-repository';
import type { VideoSearchRepository } from '@/domain/repositories/video-search-repository';
import {
  createLinkVideo,
  createUnlinkVideo,
  type LinkVideo,
  type UnlinkVideo,
} from '@/domain/use-cases/link-video';
import { createSearchVideos, type SearchVideos } from '@/domain/use-cases/search-videos';
import { createGetSongChart, type GetSongChart } from '@/domain/use-cases/get-song-chart';
import { createImportChart, type ImportChart } from '@/domain/use-cases/import-chart';
import { createSearchSongs, type SearchSongs } from '@/domain/use-cases/search-songs';
import {
  createGetCurrentMember,
  type GetCurrentMember,
} from '@/domain/use-cases/get-current-member';
import {
  createRequestPasswordReset,
  type RequestPasswordReset,
} from '@/domain/use-cases/request-password-reset';
import { createSignIn, type SignIn } from '@/domain/use-cases/sign-in';
import { createSignOut, type SignOut } from '@/domain/use-cases/sign-out';

export interface Repositories {
  auth: AuthRepository;
  profiles: ProfileRepository;
  songs: SongRepository;
  charts: SongChartRepository;
  videos: VideoSearchRepository;
}

export interface UseCases {
  signIn: SignIn;
  signOut: SignOut;
  requestPasswordReset: RequestPasswordReset;
  getCurrentMember: GetCurrentMember;
  searchSongs: SearchSongs;
  getSongChart: GetSongChart;
  importChart: ImportChart;
  searchVideos: SearchVideos;
  linkVideo: LinkVideo;
  unlinkVideo: UnlinkVideo;
}

export interface Container {
  repositories: Repositories;
  useCases: UseCases;
}

/** Único lugar do app que conhece implementações concretas (composition root). */
export function createContainer(options: ClientOptions = {}): Container {
  const client = createSupabaseClient(options);

  return createContainerFrom({
    auth: createSupabaseAuthRepository(client),
    profiles: createSupabaseProfileRepository(client),
    songs: createSupabaseSongRepository(client),
    charts: createSupabaseSongChartRepository(client),
    videos: createYouTubeSearchAdapter(client),
  });
}

/** Monta os use-cases sobre quaisquer repositórios — inclusive os de teste. */
export function createContainerFrom(repositories: Repositories): Container {
  return {
    repositories,
    useCases: {
      signIn: createSignIn({ auth: repositories.auth }),
      signOut: createSignOut({ auth: repositories.auth }),
      requestPasswordReset: createRequestPasswordReset({ auth: repositories.auth }),
      getCurrentMember: createGetCurrentMember({
        auth: repositories.auth,
        profiles: repositories.profiles,
      }),
      searchSongs: createSearchSongs({ songs: repositories.songs }),
      getSongChart: createGetSongChart({
        songs: repositories.songs,
        charts: repositories.charts,
      }),
      importChart: createImportChart({ charts: repositories.charts }),
      searchVideos: createSearchVideos({ videos: repositories.videos }),
      linkVideo: createLinkVideo({ songs: repositories.songs }),
      unlinkVideo: createUnlinkVideo({ songs: repositories.songs }),
    },
  };
}
