/**
 * Appium Test Helpers — Central Exports
 *
 * Import from this file for cleaner test imports:
 *   import { setupApp, switchToWebView } from '../helpers/index.js';
 */

export {
  setupApp,
  waitForAppReady,
  waitForRenderIdle,
  getCanvasSnapshot,
  selectTier,
  openAccordion,
  getComputedCSS,
  headElementExists,
  isCapacitorNative,
  getBaseUrl,
  getApiQrUrl,
} from './app-setup.js';

export {
  switchToWebView,
  switchToNative,
  getCurrentContext,
  isInWebView,
  isIOSDevice,
  isAndroidDevice,
} from './context.js';
