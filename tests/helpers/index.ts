/**
 * Test Helpers Index
 *
 * Central export point for all test utilities.
 * Prefer importing from this file for cleaner imports.
 *
 * IMPORTANT: All tests MUST dismiss the WelcomeModal!
 * Use setWelcomeModalSeen() BEFORE navigation, or use setupTest()/navigateToApp().
 */

// Primary E2E library - use this for new tests
export * from './e2e-library';
// Input helpers
export { setColorInput, setSlider, setTextInput, toggleSwitch } from './input-helpers';

// Legacy helpers - for backward compatibility with existing tests
export {
  clickSelectOption,
  getCanvasSnapshot,
  snapshotsAreDifferent,
  waitForAccordionOpen,
  waitForQRStable,
  waitForSelectClosed,
  waitForSelectOpen,
} from './qr-detector';
// Settings registry
export {
  getQRChangingSettings,
  getSettingsForSection,
  getSettingsForTier,
  SETTINGS_REGISTRY,
} from './settings-registry';

// Visual comparison (pixelmatch + pngjs) for cross-platform parity
export {
  comparePngBuffers,
  dataUrlToPngBuffer,
  detectImageFormat,
  getPngDimensions,
  isValidPng,
  type CompareOptions,
  type CompareResult,
} from './visual-compare';

// Test setup
export {
  enableBrowserDebug,
  getCanvasDataUrl,
  waitForAppReady,
  waitForCanvasStable,
  waitForRenderingIdle,
} from './test-setup';
// Comprehensive test utilities (test-utils.ts)
export {
  type AccordionSection,
  type AccordionState,
  // Constants
  DEFAULT_TIMEOUT,
  dismissWelcomeModal as dismissWelcomeModalUtils,
  // Scroll
  ensureVisibleInSidebar,
  expectCanvasChanged,
  getAccordionRegion,
  getCanvas as getCanvasUtils,
  // Visual assertions
  getCanvasSnapshot as getCanvasSnapshotUtils,
  // Selectors
  getControl,
  getSidebarScroller,
  navigateToApp,
  openAccordion,
  RENDER_TIMEOUT,
  type RenderState,
  resetAppState,
  SECTION_LABELS,
  type SwitchState,
  selectOption as selectOptionUtils,
  // Tier and accordion
  selectTier as selectTierUtils,
  setInput,
  // Controls
  setSlider as setSliderUtils,
  setWelcomeModalSeen,
  snapshotsAreDifferent as snapshotsAreDifferentUtils,
  TIER_LABELS,
  // Types
  type Tier as TierType,
  toggleSwitch as toggleSwitchUtils,
  uploadFile,
  // Welcome modal handling (REQUIRED for all tests)
  WELCOME_MODAL_STORAGE_KEY,
  WELCOME_MODAL_VERSION,
  waitForAccordionState as waitForAccordionStateUtils,
  waitForCanvasChange as waitForCanvasChangeUtils,
  waitForCanvasStable as waitForCanvasStableUtils,
  waitForControlReady,
  waitForDropdownClosed,
  waitForDropdownOpen,
  // Waits
  waitForRenderComplete,
} from './test-utils';
