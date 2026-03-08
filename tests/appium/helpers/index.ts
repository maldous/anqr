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
} from './app-setup.js';

export { switchToWebView, switchToNative, getCurrentContext, isInWebView } from './context.js';
