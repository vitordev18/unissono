import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Uníssono',
  slug: 'unissono',
  version: '0.1.0',
  scheme: 'unissono',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'br.com.unissono.app',
  },
  android: {
    package: 'br.com.unissono.app',
    adaptiveIcon: {
      backgroundImage: './assets/images/android-icon-background.png',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
