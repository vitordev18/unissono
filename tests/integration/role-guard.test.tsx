import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { RequireLeader } from '@/features/auth/components/require-leader';
import { HomeScreen } from '@/features/home/screens/home-screen';

import {
  createFakeAuthRepository,
  createFakeProfileRepository,
  perfilDoLider,
  perfilDoMusico,
} from '../support/fakes';
import { renderWithProviders } from '../support/render';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

function autenticadoComo(perfil: typeof perfilDoLider) {
  return {
    auth: createFakeAuthRepository({
      sessaoInicial: { userId: perfil.id, email: 'membro@igreja.com' },
    }),
    profiles: createFakeProfileRepository([perfil]),
  };
}

describe('guarda de rota por papel', () => {
  it('abre a área da liderança para o líder', async () => {
    await renderWithProviders(
      <RequireLeader>
        <Text>Conteúdo da liderança</Text>
      </RequireLeader>,
      autenticadoComo(perfilDoLider),
    );

    expect(await screen.findByText('Conteúdo da liderança')).toBeOnTheScreen();
  });

  it('bloqueia a área da liderança para o músico', async () => {
    await renderWithProviders(
      <RequireLeader>
        <Text>Conteúdo da liderança</Text>
      </RequireLeader>,
      autenticadoComo(perfilDoMusico),
    );

    expect(
      await screen.findByText('Você não tem permissão para acessar esta área.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Conteúdo da liderança')).not.toBeOnTheScreen();
  });

  it('bloqueia a área da liderança para um líder desativado', async () => {
    await renderWithProviders(
      <RequireLeader>
        <Text>Conteúdo da liderança</Text>
      </RequireLeader>,
      autenticadoComo({ ...perfilDoLider, isActive: false }),
    );

    expect(screen.queryByText('Conteúdo da liderança')).not.toBeOnTheScreen();
  });
});

describe('HomeScreen', () => {
  it('saúda o membro autenticado com papel e instrumento', async () => {
    await renderWithProviders(<HomeScreen />, autenticadoComo(perfilDoMusico));

    expect(await screen.findByText('Olá, Músico Um')).toBeOnTheScreen();
    expect(screen.getByText('Músico · Teclado')).toBeOnTheScreen();
  });
});
