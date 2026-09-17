/**
 * Tipagem mínima do banco para os testes de RLS.
 *
 * Temporária: na Fase 3 o arquivo gerado pelo Supabase
 * (`src/data/supabase/database.types.ts`) passa a ser a fonte única de tipos e
 * este arquivo é removido. Aqui só existem as colunas que os testes tocam —
 * sem isso, o cliente do Supabase infere `never` nos payloads de update.
 */

export type UserRole = 'lider' | 'musico';
export type ScheduleStatus = 'rascunho' | 'publicada' | 'cancelada';

type ProfileRow = {
  id: string;
  name: string;
  role: UserRole;
  instrument: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SongRow = {
  id: string;
  title: string;
  artist: string | null;
  default_key: string | null;
  bpm: number | null;
  tags: string[];
  youtube_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type SongChartRow = {
  id: string;
  song_id: string;
  content_chordpro: string;
  key: string;
  version: number;
  created_by: string | null;
  created_at: string;
};

type ServiceScheduleRow = {
  id: string;
  date: string;
  service_type: string;
  status: ScheduleStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ScheduleSongRow = {
  id: string;
  schedule_id: string;
  song_id: string;
  key: string | null;
  position: number;
  created_at: string;
};

type ScheduleAssignmentRow = {
  id: string;
  schedule_id: string;
  profile_id: string;
  instrument_role: string;
  created_at: string;
};

type RepertoireRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type RepertoireSongRow = {
  repertoire_id: string;
  song_id: string;
  position: number;
  created_at: string;
};

type PersonalSetlistRow = {
  id: string;
  owner_profile_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type PersonalSetlistSongRow = {
  setlist_id: string;
  song_id: string;
  position: number;
  created_at: string;
};

type RehearsalSessionRow = {
  id: string;
  song_id: string;
  profile_id: string;
  notes: string | null;
  loop_start: number | null;
  loop_end: number | null;
  playback_speed: number;
  created_at: string;
  updated_at: string;
};

type Tabela<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type TestDatabase = {
  // O cliente do Supabase usa esta chave para escolher o dialeto do PostgREST.
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      profiles: Tabela<ProfileRow>;
      songs: Tabela<SongRow>;
      song_charts: Tabela<SongChartRow>;
      service_schedules: Tabela<ServiceScheduleRow>;
      schedule_songs: Tabela<ScheduleSongRow>;
      schedule_assignments: Tabela<ScheduleAssignmentRow>;
      repertoires: Tabela<RepertoireRow>;
      repertoire_songs: Tabela<RepertoireSongRow>;
      personal_setlists: Tabela<PersonalSetlistRow>;
      personal_setlist_songs: Tabela<PersonalSetlistSongRow>;
      rehearsal_sessions: Tabela<RehearsalSessionRow>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      schedule_status: ScheduleStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
