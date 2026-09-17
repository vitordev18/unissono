/** Classe de altura: 0 = dó, 1 = dó sustenido … 11 = si. */
export type PitchClass = number;

export interface Chord {
  /** Fundamental em classe de altura; a grafia depende da estratégia de acidentes. */
  root: PitchClass;
  /** Sufixo mantido intacto: m, 7M, sus4, 9, º, add9, (b5)… */
  suffix: string;
  /** Baixo invertido (D/F#); null quando não há. */
  bass: PitchClass | null;
}

export interface MusicalKey {
  root: PitchClass;
  minor: boolean;
}

export interface Segment {
  chord: Chord | null;
  lyric: string;
}

export interface Line {
  segments: Segment[];
}

export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'ending' | 'other';

export interface Section {
  type: SectionType;
  /** Rótulo exibido ("Refrão", "Verso 1"); null usa o rótulo padrão do tipo. */
  label: string | null;
  lines: Line[];
}

export interface ChartDocument {
  title: string | null;
  artist: string | null;
  key: MusicalKey | null;
  sections: Section[];
}
