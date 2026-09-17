import type { AuthSession, Credentials } from '@/domain/entities/auth';
import { AuthError, NotFoundError } from '@/domain/entities/errors';
import type { Profile } from '@/domain/entities/profile';
import type { Song, SongChart } from '@/domain/entities/song';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';
import type { SongChartRepository } from '@/domain/repositories/song-chart-repository';
import type { SongRepository } from '@/domain/repositories/song-repository';

export const perfilDoLider: Profile = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Líder de Teste',
  role: 'lider',
  instrument: 'Violão',
  avatarUrl: null,
  isActive: true,
};

export const perfilDoMusico: Profile = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Músico Um',
  role: 'musico',
  instrument: 'Teclado',
  avatarUrl: null,
  isActive: true,
};

interface FakeAuthOptions {
  sessaoInicial?: AuthSession | null;
  senhaValida?: string;
}

/**
 * Implementação em memória do mesmo contrato usado em produção (LSP).
 * Se o repositório do Supabase e este divergirem, os testes não protegem nada —
 * por isso os dois cumprem exatamente a interface do domínio.
 */
export function createFakeAuthRepository(options: FakeAuthOptions = {}) {
  const senhaValida = options.senhaValida ?? 'senha-correta';
  let sessao: AuthSession | null = options.sessaoInicial ?? null;
  const ouvintes = new Set<(session: AuthSession | null) => void>();

  const repositorio: AuthRepository = {
    getSession: () => Promise.resolve(sessao),

    signIn: (credentials: Credentials) => {
      if (credentials.password !== senhaValida) {
        return Promise.reject(new AuthError('credenciais-invalidas', 'E-mail ou senha inválidos.'));
      }

      sessao = { userId: perfilDoMusico.id, email: credentials.email };
      ouvintes.forEach((ouvinte) => {
        ouvinte(sessao);
      });

      return Promise.resolve(sessao);
    },

    signOut: () => {
      sessao = null;
      ouvintes.forEach((ouvinte) => {
        ouvinte(null);
      });

      return Promise.resolve();
    },

    sendPasswordReset: () => Promise.resolve(),

    onSessionChange: (listener) => {
      ouvintes.add(listener);

      return () => {
        ouvintes.delete(listener);
      };
    },
  };

  return repositorio;
}

export function createFakeProfileRepository(perfis: Profile[] = [perfilDoMusico, perfilDoLider]) {
  const porId = new Map(perfis.map((perfil) => [perfil.id, perfil]));

  const repositorio: ProfileRepository = {
    getById: (id: string) => {
      const perfil = porId.get(id);

      if (!perfil) {
        return Promise.reject(new NotFoundError('Perfil não encontrado para este usuário.'));
      }

      return Promise.resolve(perfil);
    },

    updateOwn: (id, patch) => {
      const perfil = porId.get(id);

      if (!perfil) {
        return Promise.reject(new NotFoundError('Perfil não encontrado para este usuário.'));
      }

      const atualizado: Profile = {
        ...perfil,
        name: patch.name ?? perfil.name,
        instrument: patch.instrument === undefined ? perfil.instrument : patch.instrument,
      };

      porId.set(id, atualizado);

      return Promise.resolve(atualizado);
    },
  };

  return repositorio;
}

export const musicaDeTeste: Song = {
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  title: 'Música de teste A',
  artist: 'Ministério de Teste',
  defaultKey: 'G',
  bpm: 72,
  tags: ['adoração'],
  youtubeUrl: null,
};

export const cifraDeTeste = `{title: Música de teste A}
{key: G}
{start_of_verse}
[G]Primeira linha de [D]exemplo
[Em]Segunda linha de [C]exemplo
{end_of_verse}`;

export function createFakeSongRepository(musicas: Song[] = [musicaDeTeste]): SongRepository {
  const porId = new Map(musicas.map((musica) => [musica.id, musica]));

  return {
    search: (filter) => {
      const termo = filter.term?.toLowerCase() ?? '';

      return Promise.resolve(
        [...porId.values()].filter((musica) => {
          const casaTermo =
            termo.length === 0 ||
            `${musica.title} ${musica.artist ?? ''}`.toLowerCase().includes(termo);
          const casaTags = !filter.tags || filter.tags.every((tag) => musica.tags.includes(tag));

          return casaTermo && casaTags;
        }),
      );
    },

    getById: (id) => {
      const musica = porId.get(id);

      if (!musica) {
        return Promise.reject(new NotFoundError('Música não encontrada.'));
      }

      return Promise.resolve(musica);
    },

    create: (input) => {
      const nova: Song = {
        id: `aaaaaaaa-0000-4000-8000-${String(porId.size + 900).padStart(12, '0')}`,
        title: input.title,
        artist: input.artist,
        defaultKey: input.defaultKey,
        bpm: input.bpm,
        tags: input.tags,
        youtubeUrl: null,
      };

      porId.set(nova.id, nova);

      return Promise.resolve(nova);
    },
  };
}

/** Espelha o trigger do banco: a versão é atribuída no momento de salvar. */
export function createFakeSongChartRepository(
  iniciais: { songId: string; contentChordPro: string; key: string }[] = [
    { songId: musicaDeTeste.id, contentChordPro: cifraDeTeste, key: 'G' },
  ],
): SongChartRepository {
  const cifras: SongChart[] = iniciais.map((entrada, indice) => ({
    id: `bbbbbbbb-0000-4000-8000-${String(indice + 1).padStart(12, '0')}`,
    songId: entrada.songId,
    contentChordPro: entrada.contentChordPro,
    key: entrada.key,
    version: indice + 1,
    createdAt: new Date('2026-09-01T12:00:00Z').toISOString(),
  }));

  return {
    getLatest: (songId) => {
      const daMusica = cifras.filter((cifra) => cifra.songId === songId);
      const ultima = daMusica.sort((a, b) => b.version - a.version)[0];

      return Promise.resolve(ultima ?? null);
    },

    listVersions: (songId) =>
      Promise.resolve(
        cifras.filter((cifra) => cifra.songId === songId).sort((a, b) => b.version - a.version),
      ),

    create: (input) => {
      const maiorVersao = cifras
        .filter((cifra) => cifra.songId === input.songId)
        .reduce((maior, cifra) => Math.max(maior, cifra.version), 0);

      const nova: SongChart = {
        id: `bbbbbbbb-0000-4000-8000-${String(cifras.length + 1).padStart(12, '0')}`,
        songId: input.songId,
        contentChordPro: input.contentChordPro,
        key: input.key,
        version: maiorVersao + 1,
        createdAt: new Date().toISOString(),
      };

      cifras.push(nova);

      return Promise.resolve(nova);
    },
  };
}
