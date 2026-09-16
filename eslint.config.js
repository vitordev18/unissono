const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const tseslint = require('typescript-eslint');

/**
 * Regras de camada (docs/architecture.md §2.1). O linter é a primeira barreira
 * contra violação da regra de dependência da Clean Architecture.
 */
const domainBoundaries = {
  files: ['src/domain/**/*.ts', 'src/domain/**/*.tsx'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              'react',
              'react-native',
              'react-native/*',
              'expo',
              'expo-*',
              '@supabase/*',
              '@/data/*',
              '@/features/*',
              '@/components/*',
              '@/store/*',
            ],
            message:
              'src/domain não pode depender de UI, Expo ou infraestrutura. Use interfaces em src/domain/repositories.',
          },
        ],
      },
    ],
  },
};

const dataBoundaries = {
  files: ['src/data/**/*.ts', 'src/data/**/*.tsx'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*', '@/components/*', 'expo-router'],
            message: 'A camada de dados não pode depender da apresentação.',
          },
        ],
      },
    ],
  },
};

const presentationBoundaries = {
  files: ['app/**/*.ts', 'app/**/*.tsx', 'src/features/**/*.ts', 'src/features/**/*.tsx'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@supabase/*', '@/data/*', '**/data/supabase/*', '**/data/youtube/*'],
            message:
              'A UI não acessa infraestrutura diretamente. Consuma use-cases via useRepositories().',
          },
        ],
      },
    ],
  },
};

module.exports = defineConfig([
  expoConfig,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Arquivos de configuração do toolchain são CommonJS por exigência do
    // Metro/Babel/ESLint: não valem as regras de módulo ES nem lint com tipos.
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  domainBoundaries,
  dataBoundaries,
  presentationBoundaries,
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'android/**',
      'ios/**',
      'expo-env.d.ts',
    ],
  },
]);
