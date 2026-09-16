module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'db',
        'auth',
        'cifras',
        'youtube',
        'escalas',
        'repertorio',
        'treino',
        'setlists',
        'tema',
        'ci',
        'deps',
        '',
      ],
    ],
  },
};
