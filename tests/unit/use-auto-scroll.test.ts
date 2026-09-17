import { act, renderHook } from '@testing-library/react-native';

import { useAutoScroll } from '@/features/cifras/hooks/use-auto-scroll';

/** Relógio controlado à mão: cada quadro só acontece quando o teste manda. */
function criarRelogio() {
  const pendentes = new Map<number, (tempo: number) => void>();
  let proximoId = 1;

  return {
    scheduler: {
      request: (callback: (tempo: number) => void) => {
        const id = proximoId;

        proximoId += 1;
        pendentes.set(id, callback);

        return id;
      },
      cancel: (id: number) => {
        pendentes.delete(id);
      },
    },
    async quadro(instante: number): Promise<boolean> {
      const entrada = [...pendentes.entries()][0];

      if (!entrada) {
        return false;
      }

      const [id, callback] = entrada;

      pendentes.delete(id);
      await act(async () => {
        callback(instante);
        await Promise.resolve();
      });

      return true;
    },
    get quadrosAgendados() {
      return pendentes.size;
    },
  };
}

async function montar(relogio: ReturnType<typeof criarRelogio>, posicoes: number[]) {
  return renderHook(() =>
    useAutoScroll({
      contentHeight: 2000,
      viewportHeight: 800,
      // 1200 px de rolagem em 60 s = 20 px/s.
      durationSeconds: 60,
      onScroll: (offset) => posicoes.push(offset),
      scheduler: relogio.scheduler,
    }),
  );
}

async function executar(acao: () => void): Promise<void> {
  await act(async () => {
    acao();
    await Promise.resolve();
  });
}

describe('useAutoScroll', () => {
  it('começa parado, no início da cifra', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    expect(result.current.rolando).toBe(false);
    expect(result.current.offset).toBe(0);
    expect(result.current.progresso).toBe(0);
    expect(relogio.quadrosAgendados).toBe(0);
  });

  it('avança conforme o tempo enquanto está rolando', async () => {
    const relogio = criarRelogio();
    const posicoes: number[] = [];
    const { result } = await montar(relogio, posicoes);

    await executar(result.current.play);

    await relogio.quadro(1000);
    await relogio.quadro(2000);

    // O primeiro quadro só marca o instante inicial; o segundo anda 1 s a 20 px/s.
    expect(result.current.offset).toBe(20);
    expect(posicoes.at(-1)).toBe(20);
    expect(result.current.rolando).toBe(true);
  });

  it('para de agendar quadros ao pausar', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    await executar(result.current.play);
    await relogio.quadro(1000);
    await relogio.quadro(2000);

    await executar(result.current.pause);

    expect(result.current.rolando).toBe(false);
    expect(relogio.quadrosAgendados).toBe(0);
    await expect(relogio.quadro(3000)).resolves.toBe(false);
  });

  it('dobra a distância percorrida ao acelerar', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    await executar(() => {
      result.current.acelerar();
    });
    await executar(() => {
      result.current.acelerar();
    });
    await executar(() => {
      result.current.acelerar();
    });
    await executar(() => {
      result.current.acelerar();
    });

    expect(result.current.multiplicador).toBe(2);

    await executar(result.current.play);
    await relogio.quadro(1000);
    await relogio.quadro(2000);

    expect(result.current.offset).toBe(40);
  });

  it('respeita os limites de velocidade', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    for (let i = 0; i < 20; i += 1) {
      await executar(() => {
        result.current.acelerar();
      });
    }
    expect(result.current.multiplicador).toBe(3);

    for (let i = 0; i < 40; i += 1) {
      await executar(() => {
        result.current.desacelerar();
      });
    }
    expect(result.current.multiplicador).toBe(0.25);
  });

  it('para sozinho ao chegar no fim da cifra', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    await executar(result.current.play);

    await relogio.quadro(0);
    await relogio.quadro(120_000);

    expect(result.current.offset).toBe(1200);
    expect(result.current.progresso).toBe(1);
    expect(result.current.rolando).toBe(false);
    expect(relogio.quadrosAgendados).toBe(0);
  });

  it('reinicia do topo', async () => {
    const relogio = criarRelogio();
    const posicoes: number[] = [];
    const { result } = await montar(relogio, posicoes);

    await executar(result.current.play);
    await relogio.quadro(0);
    await relogio.quadro(10_000);
    expect(result.current.offset).toBeGreaterThan(0);

    await executar(result.current.reiniciar);

    expect(result.current.offset).toBe(0);
    expect(result.current.rolando).toBe(false);
    expect(posicoes.at(-1)).toBe(0);
  });

  it('acompanha a rolagem feita com o dedo', async () => {
    const relogio = criarRelogio();
    const { result } = await montar(relogio, []);

    await executar(() => {
      result.current.sincronizarOffset(600);
    });

    expect(result.current.offset).toBe(600);
    expect(result.current.progresso).toBe(0.5);
  });
});
