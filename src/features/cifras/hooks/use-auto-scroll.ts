import { useCallback, useEffect, useRef, useState } from 'react';

import {
  calculateScrollSpeed,
  clampMultiplier,
  hasReachedEnd,
  nextOffset,
} from '@/utils/auto-scroll';

export interface AutoScrollOptions {
  contentHeight: number;
  viewportHeight: number;
  durationSeconds: number | null;
  /** Chamado a cada quadro com a nova posição; a tela decide como aplicar. */
  onScroll: (offset: number) => void;
  /** Injetável em teste; em produção é o requestAnimationFrame da plataforma. */
  scheduler?: {
    request: (callback: (tempo: number) => void) => number;
    cancel: (identificador: number) => void;
  };
}

export interface AutoScrollControls {
  rolando: boolean;
  multiplicador: number;
  offset: number;
  progresso: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  acelerar: () => void;
  desacelerar: () => void;
  reiniciar: () => void;
  /** Sincroniza o estado quando o músico rola a cifra com o dedo. */
  sincronizarOffset: (offset: number) => void;
}

const PASSO_DO_MULTIPLICADOR = 0.25;

/**
 * Rolagem automática quadro a quadro (US-27).
 *
 * O cálculo mora em src/utils/auto-scroll.ts; aqui só existe o laço de
 * animação, o estado dos controles e a parada no fim da cifra.
 */
export function useAutoScroll({
  contentHeight,
  viewportHeight,
  durationSeconds,
  onScroll,
  scheduler,
}: AutoScrollOptions): AutoScrollControls {
  const [rolando, setRolando] = useState(false);
  const [multiplicador, setMultiplicador] = useState(1);
  const [offset, setOffset] = useState(0);

  const offsetRef = useRef(0);
  const quadroRef = useRef<number | null>(null);
  const ultimoInstanteRef = useRef<number | null>(null);
  const onScrollRef = useRef(onScroll);

  // O callback é guardado num ref para que trocar de função no componente pai
  // não reinicie o laço de animação no meio da rolagem.
  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  const maxOffset = Math.max(0, contentHeight - viewportHeight);
  const velocidade = calculateScrollSpeed({
    contentHeight,
    viewportHeight,
    durationSeconds,
    multiplier: multiplicador,
  });

  const pause = useCallback(() => {
    setRolando(false);
  }, []);

  const play = useCallback(() => {
    setRolando(true);
  }, []);

  const toggle = useCallback(() => {
    setRolando((estado) => !estado);
  }, []);

  const sincronizarOffset = useCallback((novoOffset: number) => {
    offsetRef.current = novoOffset;
    setOffset(novoOffset);
  }, []);

  const reiniciar = useCallback(() => {
    setRolando(false);
    offsetRef.current = 0;
    setOffset(0);
    onScrollRef.current(0);
  }, []);

  const acelerar = useCallback(() => {
    setMultiplicador((atual) => clampMultiplier(atual + PASSO_DO_MULTIPLICADOR));
  }, []);

  const desacelerar = useCallback(() => {
    setMultiplicador((atual) => clampMultiplier(atual - PASSO_DO_MULTIPLICADOR));
  }, []);

  useEffect(() => {
    if (!rolando || velocidade <= 0) {
      return;
    }

    const relogio = scheduler ?? {
      request: (callback: (tempo: number) => void) => requestAnimationFrame(callback),
      cancel: (identificador: number) => {
        cancelAnimationFrame(identificador);
      },
    };

    const passo = (instante: number) => {
      const anterior = ultimoInstanteRef.current ?? instante;
      const decorrido = instante - anterior;

      ultimoInstanteRef.current = instante;

      const novo = nextOffset({
        offset: offsetRef.current,
        speed: velocidade,
        elapsedMs: decorrido,
        maxOffset,
      });

      offsetRef.current = novo;
      setOffset(novo);
      onScrollRef.current(novo);

      if (hasReachedEnd(novo, maxOffset)) {
        setRolando(false);

        return;
      }

      quadroRef.current = relogio.request(passo);
    };

    quadroRef.current = relogio.request(passo);

    return () => {
      ultimoInstanteRef.current = null;

      if (quadroRef.current !== null) {
        relogio.cancel(quadroRef.current);
        quadroRef.current = null;
      }
    };
  }, [rolando, velocidade, maxOffset, scheduler]);

  return {
    rolando,
    multiplicador,
    offset,
    progresso: maxOffset <= 0 ? 0 : Math.min(1, offset / maxOffset),
    play,
    pause,
    toggle,
    acelerar,
    desacelerar,
    reiniciar,
    sincronizarOffset,
  };
}
