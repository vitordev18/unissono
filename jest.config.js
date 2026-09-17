/**
 * Dois projetos com ambientes diferentes:
 *
 * - "app": preset jest-expo, para código que depende do React Native.
 * - "rls": ambiente Node puro, para os testes que falam com o Supabase por
 *   HTTP. Sob o preset do Expo, o fetch da aplicação é o polyfill do React
 *   Native e a chamada de autenticação falha com "undefined is not valid JSON".
 */
const babelTransform = [
  'babel-jest',
  { presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]] },
];

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'app',
      preset: 'jest-expo',
      rootDir: __dirname,
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.ts',
        '<rootDir>/tests/unit/**/*.test.tsx',
        '<rootDir>/tests/integration/*.test.ts',
        '<rootDir>/tests/integration/*.test.tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'rls',
      testEnvironment: 'node',
      rootDir: __dirname,
      testMatch: ['<rootDir>/tests/integration/rls/**/*.test.ts'],
      transform: { '^.+\.[jt]sx?$': babelTransform },
      // babel-preset-expo injeta um import ESM de expo/virtual/env.js.
      transformIgnorePatterns: ['node_modules/(?!(expo|@expo)/)'],
    },
  ],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
