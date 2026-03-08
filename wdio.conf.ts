import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCI = !!process.env.CI;

const ANDROID_APK = path.join(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk');

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
  'appium:app': process.env.APPIUM_APP || '',
  'appium:deviceName': process.env.APPIUM_DEVICE || 'iPhone 16',
  'appium:autoAcceptAlerts': true,
  'appium:newCommandTimeout': 300,
  'appium:ensureWebviewsHavePages': true,
};

export const config = {
  runner: 'local' as const,
  port: 4723,
  specs: ['./tests/appium/specs/**/*.spec.ts'],
  exclude: [] as string[],

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
