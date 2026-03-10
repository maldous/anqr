import type { CapacitorConfig } from '@capacitor/cli';

const androidAdmobAppId = process.env.VITE_ADMOB_APP_ID || '';
const iosAdmobAppId = process.env.VITE_ADMOB_IOS_APP_ID || '';

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
      // App IDs are injected via env/CI secrets.
      androidAppId: androidAdmobAppId,
      iosAppId: iosAdmobAppId,
      initializeForTesting: true,
    },
  },
};

export default config;
