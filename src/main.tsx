import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Initialize i18n
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeAdMob, showBannerAd } from './modules/platform';

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
