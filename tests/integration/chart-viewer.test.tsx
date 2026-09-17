import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { ChartViewerScreen } from '@/features/cifras/screens/chart-viewer-screen';
import { useReaderPrefs } from '@/store/reader-prefs';

import { musicaDeTeste } from '../support/fakes';
import { renderWithProviders } from '../support/render';

// O prefixo "mock" é exigido pelo Jest para variáveis usadas na fábrica do mock.
const mockParametros: { id: string; tom?: string } = { id: musicaDeTeste.id };

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParametros,
}));

describe('ChartViewerScreen', () => {
  beforeEach(() => {
    delete mockParametros.tom;
    useReaderPrefs.setState({ fontSize: 18, showChords: true, accidental: 'pelo-tom' });
  });

  it('mostra a cifra no tom original', async () => {
    await renderWithProviders(<ChartViewerScreen />);

    expect(await screen.findByText('Música de teste A')).toBeOnTheScreen();
    expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('G');
    // O G aparece duas vezes: no seletor de tom e como acorde da primeira linha.
    expect(screen.getAllByText('G').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Em')).toBeOnTheScreen();
    expect(screen.getByText('Primeira linha de ')).toBeOnTheScreen();
  });

  it('sobe e desce meio tom mantendo a letra', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Subir meio tom'));

    // Um semitom acima de Sol é Lá bemol, não Sol sustenido: a armadura de
    // clave manda, e é assim que a cifra deve aparecer para quem lê.
    await waitFor(() => {
      expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('Ab');
    });
    expect(screen.getByText('Eb')).toBeOnTheScreen();
    expect(screen.getByText('Fm')).toBeOnTheScreen();
    expect(screen.getByText('Primeira linha de ')).toBeOnTheScreen();

    await usuario.press(screen.getByLabelText('Descer meio tom'));

    await waitFor(() => {
      expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('G');
    });
    expect(screen.getByText('Em')).toBeOnTheScreen();
  });

  it('volta ao tom original', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Subir meio tom'));
    await usuario.press(screen.getByLabelText('Subir meio tom'));
    await waitFor(() => {
      expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('A');
    });

    await usuario.press(screen.getByLabelText('Voltar ao tom original'));

    await waitFor(() => {
      expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('G');
    });
  });

  it('abre já transposta no tom pedido pela escala', async () => {
    mockParametros.tom = 'A';

    await renderWithProviders(<ChartViewerScreen />);

    expect(await screen.findByText('Música de teste A')).toBeOnTheScreen();
    expect(screen.getByLabelText('Voltar ao tom original')).toHaveTextContent('A');
    // G→A leva o Em para F#m: a cifra abre no tom do culto, não no original.
    expect(screen.getByText('F#m')).toBeOnTheScreen();
  });

  it('esconde e mostra os acordes', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Ocultar acordes'));

    await waitFor(() => {
      expect(screen.queryByText('Em')).not.toBeOnTheScreen();
    });
    expect(screen.getByText('Segunda linha de ')).toBeOnTheScreen();
  });

  it('ajusta o tamanho da fonte dentro dos limites', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Aumentar a fonte'));

    await waitFor(() => {
      expect(useReaderPrefs.getState().fontSize).toBe(20);
    });

    useReaderPrefs.setState({ fontSize: 32 });

    await waitFor(() => {
      expect(screen.getByLabelText('Aumentar a fonte')).toBeDisabled();
    });
  });

  it('avisa quando a música ainda não tem cifra', async () => {
    await renderWithProviders(<ChartViewerScreen />, {
      charts: jest
        .requireActual<typeof import('../support/fakes')>('../support/fakes')
        .createFakeSongChartRepository([]),
    });

    expect(await screen.findByText('Esta música ainda não tem cifra.')).toBeOnTheScreen();
  });
});

describe('ChartViewerScreen · rolagem automática', () => {
  beforeEach(() => {
    delete mockParametros.tom;
    useReaderPrefs.setState({ fontSize: 18, showChords: true, accidental: 'pelo-tom' });
  });

  it('começa parada, em 1×', async () => {
    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    expect(screen.getByLabelText('Iniciar rolagem')).toBeOnTheScreen();
    expect(screen.getByLabelText('Velocidade da rolagem')).toHaveTextContent('1×');
    expect(screen.getByLabelText('Progresso da rolagem')).toBeOnTheScreen();
  });

  it('alterna entre iniciar e pausar', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Iniciar rolagem'));

    expect(await screen.findByLabelText('Pausar rolagem')).toBeOnTheScreen();

    await usuario.press(screen.getByLabelText('Pausar rolagem'));

    expect(await screen.findByLabelText('Iniciar rolagem')).toBeOnTheScreen();
  });

  it('ajusta a velocidade em passos de 0,25', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<ChartViewerScreen />);
    await screen.findByText('Música de teste A');

    await usuario.press(screen.getByLabelText('Aumentar a velocidade'));

    await waitFor(() => {
      expect(screen.getByLabelText('Velocidade da rolagem')).toHaveTextContent('1,25×');
    });

    await usuario.press(screen.getByLabelText('Diminuir a velocidade'));
    await usuario.press(screen.getByLabelText('Diminuir a velocidade'));

    await waitFor(() => {
      expect(screen.getByLabelText('Velocidade da rolagem')).toHaveTextContent('0,75×');
    });
  });
});
