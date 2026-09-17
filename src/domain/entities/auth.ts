import { z } from 'zod';

/**
 * Validação da fronteira de entrada do login. O mesmo schema serve ao
 * formulário e ao use-case: a tela não é a única barreira.
 */
export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Informe um e-mail válido' })),
  password: z.string().min(8, { message: 'A senha precisa ter ao menos 8 caracteres' }),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Informe um e-mail válido' }));

export interface AuthSession {
  userId: string;
  email: string;
}
