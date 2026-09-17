import { createContext, useContext, type ReactNode } from 'react';

import type { Container } from './container';

const ContainerContext = createContext<Container | null>(null);

export function ContainerProvider({
  container,
  children,
}: {
  container: Container;
  children: ReactNode;
}) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): Container {
  const container = useContext(ContainerContext);

  if (!container) {
    throw new Error('useContainer precisa estar dentro de <ContainerProvider>.');
  }

  return container;
}

export function useUseCases(): Container['useCases'] {
  return useContainer().useCases;
}
