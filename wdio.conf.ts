import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = !!process.env.CI;

const ANDROID_APK = path.join(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk');

// Base URL for API parity checks from device context.
// iOS Simulator: localhost reaches host. Android Emulator: use 10.0.2.2.
// Override with ANQR_BASE_URL env var.
// Also used by tests/appium/helpers/app-setup.ts getBaseUrl() / getApiQrUrl().

function findIOSSimulatorApp(): string {
  const derivedData = path.join(__dirname, 'ios/DerivedData');
  if (!fs.existsSync(derivedData)) return '';
  for (const entry of fs.readdirSync(derivedData)) {
    const appPath = path.join(derivedData, entry, 'Build/Products/Debug-iphonesimulator/App.app');
    if (fs.existsSync(appPath)) return appPath;
  }
  return '';
}

export const platform = (process.env.APPIUM_PLATFORM || 'android').toLowerCase();

const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': process.env.APPIUM_APP || ANDROID_APK,
  'appium:deviceName': process.env.APPIUM_DEVICE || 'emulator-5554',
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 300,
  'appium:ensureWebviewsHavePages': true,
  'appium:nativeWebScreenshot': true,
  'appium:chromedriverAutodownload': true,
};

const iosCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:app': process.env.APPIUM_APP || findIOSSimulatorApp(),
  'appium:deviceName': process.env.APPIUM_DEVICE || 'iPhone 16',
  'appium:platformVersion': process.env.APPIUM_IOS_VERSION || '18.4',
  'appium:autoAcceptAlerts': true,
  'appium:newCommandTimeout': 300,
  'appium:ensureWebviewsHavePages': true,
  'appium:webviewConnectTimeout': 30_000,
  'appium:includeSafariInWebviews': false,
};

// Exclude platform-specific specs that don't match the selected platform.
// Shared specs (smoke, native-features) run on both platforms.
const excludeSpecs: string[] =
  platform === 'ios'
    ? ['./tests/appium/specs/android-platform.spec.ts']
    : ['./tests/appium/specs/ios-platform.spec.ts'];

export const config = {
  runner: 'local' as const,
  port: 4723,
  specs: ['./tests/appium/specs/**/*.spec.ts'],
  exclude: excludeSpecs,

  maxInstances: 1,
  capabilities: [platform === 'ios' ? iosCapabilities : androidCapabilities],

  logLevel: (isCI ? 'warn' : 'info') as 'warn' | 'info',
  bail: 0,
  waitforTimeout: 30_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  services: ['appium'] as const,

  framework: 'mocha' as const,
  mochaOpts: {
    ui: 'bdd' as const,
    timeout: 120_000,
  },

  reporters: ['spec'] as const,
};
