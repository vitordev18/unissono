import {
  calculateScrollSpeed,
  clampMultiplier,
  estimateDurationSeconds,
  formatMultiplier,
  hasReachedEnd,
  nextOffset,
  VELOCIDADE_PADRAO_PX_POR_SEGUNDO,
} from '@/utils/auto-scroll';

describe('estimateDurationSeconds', () => {
  it('estima a duração a partir do andamento e do tamanho da cifra', () => {
    // 20 linhas ≈ 20 compassos de 4 tempos a 80 bpm = 80 batidas → 60 s.
    expect(estimateDurationSeconds({ bpm: 80, lineCount: 20 })).toBe(60);
  });

  it('acompanha o andamento: dobrar o bpm corta a duração pela metade', () => {
    const lento = estimateDurationSeconds({ bpm: 60, lineCount: 16 });
    const rapido = estimateDurationSeconds({ bpm: 120, lineCount: 16 });

    expect(lento).toBe(64);
    expect(rapido).toBe(32);
  });

  it('não estima sem bpm ou sem conteúdo', () => {
    expect(estimateDurationSeconds({ bpm: null, lineCount: 20 })).toBeNull();
    expect(estimateDurationSeconds({ bpm: 90, lineCount: 0 })).toBeNull();
    expect(estimateDurationSeconds({ bpm: 0, lineCount: 20 })).toBeNull();
  });
});

describe('calculateScrollSpeed', () => {
  it('distribui a rolagem ao longo da duração da música', () => {
    // Sobram 1200 px para rolar em 60 s → 20 px/s.
    expect(
      calculateScrollSpeed({ contentHeight: 2000, viewportHeight: 800, durationSeconds: 60 }),
    ).toBe(20);
  });

  it('aplica o multiplicador escolhido pelo músico', () => {
    const base = { contentHeight: 2000, viewportHeight: 800, durationSeconds: 60 };

    expect(calculateScrollSpeed({ ...base, multiplier: 2 })).toBe(40);
    expect(calculateScrollSpeed({ ...base, multiplier: 0.5 })).toBe(10);
  });

  it('não rola quando a cifra cabe na tela', () => {
    expect(
      calculateScrollSpeed({ contentHeight: 600, viewportHeight: 800, durationSeconds: 60 }),
    ).toBe(0);
  });

  it('cai numa velocidade de leitura confortável sem duração conhecida', () => {
    expect(
      calculateScrollSpeed({ contentHeight: 2000, viewportHeight: 800, durationSeconds: null }),
    ).toBe(VELOCIDADE_PADRAO_PX_POR_SEGUNDO);
  });

  it('respeita os limites do multiplicador', () => {
    expect(clampMultiplier(10)).toBe(3);
    expect(clampMultiplier(0.01)).toBe(0.25);
  });
});

describe('nextOffset', () => {
  it('avança conforme o tempo decorrido', () => {
    expect(nextOffset({ offset: 100, speed: 20, elapsedMs: 500, maxOffset: 1000 })).toBe(110);
  });

  it('para no fim do conteúdo', () => {
    expect(nextOffset({ offset: 995, speed: 20, elapsedMs: 1000, maxOffset: 1000 })).toBe(1000);
  });

  it('nunca volta antes do início', () => {
    expect(nextOffset({ offset: 5, speed: -100, elapsedMs: 1000, maxOffset: 1000 })).toBe(0);
  });
});

describe('hasReachedEnd', () => {
  it('reconhece o fim da cifra', () => {
    expect(hasReachedEnd(1000, 1000)).toBe(true);
    expect(hasReachedEnd(400, 1000)).toBe(false);
    expect(hasReachedEnd(0, 0)).toBe(true);
  });
});

describe('formatMultiplier', () => {
  it('mostra a velocidade no formato do app', () => {
    expect(formatMultiplier(1)).toBe('1×');
    expect(formatMultiplier(1.5)).toBe('1,5×');
    expect(formatMultiplier(0.25)).toBe('0,25×');
  });
});
