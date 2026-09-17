import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/features/auth/components/auth-gate';
import { createContainer, type Container } from '@/services/container';
import { ContainerProvider } from '@/services/container-provider';
import { createQueryClient } from '@/services/query-client';

function ErroDeConfiguracao({ mensagem }: { mensagem: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white p-6 dark:bg-neutral-950">
      <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        Configuração incompleta
      </Text>
      <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
        {mensagem}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const queryClient = useMemo(() => createQueryClient(), []);
  const montagem = useMemo<{ container: Container } | { erro: string }>(() => {
    try {
      return { container: createContainer() };
    } catch (erro) {
      return { erro: erro instanceof Error ? erro.message : 'Erro desconhecido.' };
    }
  }, []);

  if ('erro' in montagem) {
    return <ErroDeConfiguracao mensagem={montagem.erro} />;
  }

  return (
    <SafeAreaProvider>
      <ContainerProvider container={montagem.container}>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <Slot />
          </AuthGate>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </ContainerProvider>
    </SafeAreaProvider>
  );
}
