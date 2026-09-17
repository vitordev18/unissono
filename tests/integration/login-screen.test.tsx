import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/features/auth/screens/login-screen';

import { createFakeAuthRepository } from '../support/fakes';
import { renderWithProviders } from '../support/render';

jest.mock('expo-router', () => {
  const { Text: TextoRN } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Link: TextoRN,
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  };
});

describe('LoginScreen', () => {
  it('mostra o nome do ministério e os campos de acesso', async () => {
    await renderWithProviders(<LoginScreen />);

    expect(screen.getByText('Uníssono')).toBeOnTheScreen();
    expect(screen.getByLabelText('E-mail')).toBeOnTheScreen();
    expect(screen.getByLabelText('Senha')).toBeOnTheScreen();
  });

  it('recusa e-mail inválido sem chamar o repositório', async () => {
    const auth = createFakeAuthRepository();
    const espiao = jest.spyOn(auth, 'signIn');
    const usuario = userEvent.setup();

    await renderWithProviders(<LoginScreen />, { auth });

    await usuario.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await usuario.type(screen.getByLabelText('Senha'), 'senha-correta');
    await usuario.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeOnTheScreen();
    expect(espiao).not.toHaveBeenCalled();
  });

  it('exige senha com tamanho mínimo', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<LoginScreen />);

    await usuario.type(screen.getByLabelText('E-mail'), 'musico@igreja.com');
    await usuario.type(screen.getByLabelText('Senha'), '123');
    await usuario.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('A senha precisa ter ao menos 8 caracteres')).toBeOnTheScreen();
  });

  it('autentica com credenciais válidas', async () => {
    const auth = createFakeAuthRepository();
    const espiao = jest.spyOn(auth, 'signIn');
    const usuario = userEvent.setup();

    await renderWithProviders(<LoginScreen />, { auth });

    await usuario.type(screen.getByLabelText('E-mail'), 'Musico@Igreja.com');
    await usuario.type(screen.getByLabelText('Senha'), 'senha-correta');
    await usuario.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(espiao).toHaveBeenCalledWith({
        email: 'musico@igreja.com',
        password: 'senha-correta',
      });
    });
  });

  it('mostra mensagem genérica quando as credenciais não conferem', async () => {
    const usuario = userEvent.setup();

    await renderWithProviders(<LoginScreen />, { auth: createFakeAuthRepository() });

    await usuario.type(screen.getByLabelText('E-mail'), 'musico@igreja.com');
    await usuario.type(screen.getByLabelText('Senha'), 'senha-errada');
    await usuario.press(screen.getByRole('button', { name: 'Entrar' }));

    // Sem dizer qual dos dois campos falhou: não entrega quem é do ministério.
    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeOnTheScreen();
  });
});
