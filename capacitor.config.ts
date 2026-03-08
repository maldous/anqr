import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'link.anqr.app',
  appName: 'ANQR',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    buildOptions: {
      keystorePath: 'android/app/release-key.keystore',
      keystoreAlias: 'anqr',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
    AdMob: {
      // AdMob App IDs — https://admob.google.com
      androidAppId: 'ca-app-pub-2270701384951162~3067761782',
      iosAppId: 'ca-app-pub-2270701384951162~2718285064',
      initializeForTesting: false,
    },
  },
};

export default config;
