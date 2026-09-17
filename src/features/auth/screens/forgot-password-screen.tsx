import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { usePasswordReset } from '@/features/auth/hooks/use-password-reset';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const reset = usePasswordReset();

  return (
    <Screen centralizado>
      <View className="gap-6">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Redefinir senha
          </Text>
          <Text className="text-base text-neutral-600 dark:text-neutral-400">
            Enviaremos um link para o seu e-mail.
          </Text>
        </View>

        {/* A confirmação é sempre a mesma, tenha o e-mail cadastro ou não:
            dizer "este e-mail não existe" entrega quem é do ministério. */}
        {reset.isSuccess ? (
          <View
            accessibilityRole="alert"
            className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950"
          >
            <Text className="text-sm text-emerald-800 dark:text-emerald-200">
              Se este e-mail estiver cadastrado, o link de redefinição chegará em instantes.
            </Text>
          </View>
        ) : null}

        {reset.isError ? (
          <View accessibilityRole="alert" className="rounded-xl bg-red-50 p-3 dark:bg-red-950">
            <Text className="text-sm text-red-700 dark:text-red-300">{reset.error.message}</Text>
          </View>
        ) : null}

        <TextField
          label="E-mail"
          placeholder="nome@igreja.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Button
          label="Enviar link"
          carregando={reset.isPending}
          onPress={() => {
            reset.mutate(email);
          }}
        />

        <Button
          label="Voltar para o login"
          variante="secundario"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}
