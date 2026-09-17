import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { credentialsSchema, type Credentials } from '@/domain/entities/auth';
import { useSignIn } from '@/features/auth/hooks/use-sign-in';

export function LoginScreen() {
  const signIn = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const enviar = handleSubmit((valores) => {
    signIn.mutate(valores);
  });

  return (
    <Screen centralizado>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="gap-6">
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Uníssono
            </Text>
            <Text className="text-base text-neutral-600 dark:text-neutral-400">
              Ministério de louvor
            </Text>
          </View>

          {signIn.isError ? (
            <View accessibilityRole="alert" className="rounded-xl bg-red-50 p-3 dark:bg-red-950">
              <Text className="text-sm text-red-700 dark:text-red-300">{signIn.error.message}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="E-mail"
                  placeholder="nome@igreja.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  erro={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Senha"
                  placeholder="••••••••"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  secureTextEntry
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  erro={errors.password?.message}
                  onSubmitEditing={() => {
                    void enviar();
                  }}
                />
              )}
            />
          </View>

          <Button
            label="Entrar"
            carregando={signIn.isPending}
            onPress={() => {
              void enviar();
            }}
          />

          <Link
            href="/esqueci-senha"
            className="text-center text-base text-indigo-600 dark:text-indigo-400"
          >
            Esqueci minha senha
          </Link>

          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
            O acesso é criado pelo líder do ministério.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
