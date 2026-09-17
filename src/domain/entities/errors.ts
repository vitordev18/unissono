export type AuthErrorCode =
  'credenciais-invalidas' | 'conta-inativa' | 'sem-conexao' | 'dados-invalidos' | 'desconhecido';

/** Erro de domínio: a camada de dados traduz o erro do Supabase para cá. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
