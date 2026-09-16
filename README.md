# Uníssono

App mobile (Android + iOS) para o ministério de louvor: escalas de culto, repertório,
cifras com transposição e rolagem automática, vídeos de referência e treino pessoal.

> **Fase atual: 1 — scaffold.** O README completo (setup, variáveis de ambiente, contribuição,
> licença) é entregue na Fase 13. A documentação de produto e arquitetura já está em `docs/`.

## Documentação

- [Plano de produto](docs/product-plan.md) — personas, histórias de usuário, escopo do MVP
- [Arquitetura](docs/architecture.md) — camadas, padrões, modelo de dados, segurança
- [Wireframes](docs/wireframes.md) — telas e navegação

## Stack

Expo SDK 57 · React Native 0.86 · TypeScript strict · Expo Router · NativeWind ·
Supabase (Postgres + Auth + Realtime) · Jest + React Native Testing Library

## Comandos

```bash
npm start          # inicia o Metro
npm run android    # abre no Android
npm run ios        # abre no iOS (requer macOS)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Jest
```

## Ambiente

Copie `.env.example` para `.env` e preencha as variáveis. O `.env` nunca é versionado.
