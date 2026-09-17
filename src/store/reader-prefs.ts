import { create } from 'zustand';

import type { AccidentalStrategy } from '@/utils/chords';

export const TAMANHO_MINIMO = 12;
export const TAMANHO_MAXIMO = 32;

interface ReaderPrefsState {
  fontSize: number;
  showChords: boolean;
  accidental: AccidentalStrategy['id'];
  increaseFont: () => void;
  decreaseFont: () => void;
  toggleChords: () => void;
  setAccidental: (id: AccidentalStrategy['id']) => void;
}

/**
 * Preferências de leitura da cifra (US-22, US-28). Por enquanto valem só
 * enquanto o app está aberto; a persistência entra na Fase 11, junto com o tema.
 */
export const useReaderPrefs = create<ReaderPrefsState>((set) => ({
  fontSize: 18,
  showChords: true,
  accidental: 'pelo-tom',
  increaseFont: () => {
    set((estado) => ({ fontSize: Math.min(TAMANHO_MAXIMO, estado.fontSize + 2) }));
  },
  decreaseFont: () => {
    set((estado) => ({ fontSize: Math.max(TAMANHO_MINIMO, estado.fontSize - 2) }));
  },
  toggleChords: () => {
    set((estado) => ({ showChords: !estado.showChords }));
  },
  setAccidental: (id) => {
    set({ accidental: id });
  },
}));
