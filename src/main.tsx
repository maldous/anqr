import * as Sentry from '@sentry/react';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Initialize i18n
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeAdMob, showBannerAd } from './modules/platform';

// Detect if running in Capacitor (native app) environment
const isCapacitor = typeof (window as Window & { Capacitor?: unknown }).Capacitor !== 'undefined';

// Initialize Sentry for error tracking
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
  tracesSampleRate: 0.1,
  // Session replay for web only (not available in Capacitor WebView)
  replaysSessionSampleRate: isCapacitor ? 0 : 0.01,
  replaysOnErrorSampleRate: isCapacitor ? 0 : 1.0,
  // Tag environment for filtering in Sentry dashboard
  environment: isCapacitor ? 'capacitor' : 'web',
});

// Initialize AdMob for native apps after a short delay to ensure Capacitor bridge is ready
// This is more reliable than calling at module load time
const initAds = async () => {
  try {
    // Small delay to ensure Capacitor bridge is fully initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialized = await initializeAdMob();
    if (initialized) {
      // Show banner ad at bottom of screen on native apps
      await showBannerAd('bottom');
    }
  } catch (error) {
    console.error('AdMob initialization error:', error);
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
