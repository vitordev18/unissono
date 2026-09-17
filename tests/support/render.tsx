import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { ProfileRepository } from '@/domain/repositories/profile-repository';
import { createContainerFrom, type Repositories } from '@/services/container';
import { ContainerProvider } from '@/services/container-provider';

import { createFakeAuthRepository, createFakeProfileRepository } from './fakes';

export interface RenderOptions {
  auth?: AuthRepository;
  profiles?: ProfileRepository;
}

export function createTestRepositories(options: RenderOptions = {}): Repositories {
  return {
    auth: options.auth ?? createFakeAuthRepository(),
    profiles: options.profiles ?? createFakeProfileRepository(),
  };
}

/** Renderiza com o mesmo composition root do app, mas com repositórios falsos. */
export async function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const container = createContainerFrom(createTestRepositories(options));
  const queryClient = new QueryClient({
    // gcTime 0 evita timers pendurados depois que o teste termina.
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ContainerProvider container={container}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ContainerProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
