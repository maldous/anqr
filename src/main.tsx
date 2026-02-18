import * as Sentry from '@sentry/react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Initialize i18n
import { ErrorBoundary } from './components/ErrorBoundary';
import { initAutoDynamicTestIds } from './lib/auto-testid';
import { createLogger } from './lib/logger';
import { initRemoteDiagnostics } from './lib/logger-remote';
import { initializeAdMob, prepareAllAds, showBannerAd } from './modules/platform';

const log = createLogger('MAIN');

// Detect if running in Capacitor (native app) environment
const isCapacitor = typeof (window as Window & { Capacitor?: unknown }).Capacitor !== 'undefined';

// Initialize Sentry for error tracking (must be first)
// Web and Capacitor both use the same React SDK - native Android uses its own SDK in MainActivity.java
// DSN: anqr-web for web browser, anqr-mobile DSN is used in native Android code
Sentry.init({
  dsn: isCapacitor
    ? 'https://e21ce35eef457e8b07408316ee9cb262@o4510808522489856.ingest.us.sentry.io/4510808544247808'
    : 'https://4cd2d9dfc1e109caf26e9105c03cdfd6@o4510808522489856.ingest.us.sentry.io/4510808540643328',
  sendDefaultPii: true,
  // Release version for source map matching - injected at build time by Vite
  release: import.meta.env.VITE_SENTRY_RELEASE,
  // Performance monitoring - 10% of transactions
  tracesSampleRate: 0.01,
  // Suppress known expected/diagnostic errors that are not actionable
  ignoreErrors: [
    // AdMob Capacitor methods called on wrong platform — expected platform mismatch
    /is not implemented on web/,
    /is not implemented on android/,
    // QART diagnostic messages — graceful fallbacks, not real errors
    /\[QART\]/,
    /ECC budget exceeded/,
    /SEMANTIC-HARD-GATE/,
    /matrix scan validation/,
    /DECODED BYTES/,
    /HYBRID MUTATION TEST/,
    /RS LINEARITY/,
    /PROTECTED BYTES MODIFIED/,
    /BASE MATRIX VERIFICATION/,
    /BASE QR GENERATION FAILED/,
    /INTERNAL CONSISTENCY FAILURE/,
    /Structural patterns modified/,
    /FINDER PATTERNS CORRUPTED/,
    /TIMING PATTERNS CORRUPTED/,
    /FORMAT INFO CHANGED/,
    /Vector selection violates/,
    // Stale cache errors from previous deploys
    /Grid3x3 is not defined/,
    /TrackerStorageType/,
    /ditherMode/,
  ],
  // Drop non-actionable events that slip past ignoreErrors (e.g. captureMessage)
  beforeSend(event) {
    const msg = event.message || event.exception?.values?.[0]?.value || '';
    // Drop all AdMob platform mismatch errors
    if (msg.includes('is not implemented on')) return null;
    // Drop all QART diagnostic messages (sent via captureMessage from logger)
    if (msg.includes('[QART]')) return null;
    // Drop known diagnostic patterns that may not have [QART] prefix
    if (msg.includes('ECC budget exceeded')) return null;
    if (msg.includes('SEMANTIC-HARD-GATE')) return null;
    if (msg.includes('matrix scan validation')) return null;
    if (msg.includes('DECODED BYTES')) return null;
    // Drop stale cache reference errors
    if (msg.includes('Grid3x3')) return null;
    if (msg.includes('TrackerStorageType')) return null;
    if (msg.includes('ditherMode')) return null;
    return event;
  },
  // Don't send debug breadcrumbs to Sentry
  beforeBreadcrumb(breadcrumb) {
    // Filter out debug-level breadcrumbs in production
    if (breadcrumb.level === 'debug' && !import.meta.env.DEV) {
      return null;
    }
    return breadcrumb;
  },
  // Session replay for web only (not available in Capacitor WebView)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: isCapacitor ? 0 : 0.5,
  // Tag environment for filtering in Sentry dashboard
  environment: isCapacitor ? 'capacitor' : 'web',
});

// Initialize logging system (after Sentry, so errors during init are captured)
initRemoteDiagnostics();
log.info('App starting', { environment: isCapacitor ? 'capacitor' : 'web' });

// Initialize AdMob for native apps after a short delay to ensure Capacitor bridge is ready
// This is more reliable than calling at module load time
const initAds = async () => {
  try {
    // Small delay to ensure Capacitor bridge is fully initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialized = await initializeAdMob();
    if (initialized) {
      // Preload ad inventory so first user action can show an interstitial/rewarded ad.
      await prepareAllAds();
      // Show banner ad at bottom of screen on native apps
      await showBannerAd('bottom');
    }
  } catch (error) {
    log.error('AdMob initialization error', { error });
  }
};

// Start ad initialization after DOM is ready
if (document.readyState === 'complete') {
  initAds();
} else {
  globalThis.addEventListener('load', initAds, { once: true });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        }
      >
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);

// Ensure every interactive element has a unique dynamic test id.
initAutoDynamicTestIds();
