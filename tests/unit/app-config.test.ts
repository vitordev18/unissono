import config from '../../app.config';

describe('app.config', () => {
  it('mantém os identificadores de publicação estáveis', () => {
    expect(config.slug).toBe('unissono');
    expect(config.scheme).toBe('unissono');
    expect(config.ios?.bundleIdentifier).toBe('br.com.unissono.app');
    expect(config.android?.package).toBe('br.com.unissono.app');
  });

  it('usa Expo Router e rotas tipadas', () => {
    expect(config.plugins).toContain('expo-router');
    expect(config.experiments?.typedRoutes).toBe(true);
  });
});
