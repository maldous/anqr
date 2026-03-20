import { Capacitor } from "@capacitor/core";
import * as Sentry from "@sentry/react";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "../shell/app-shell.types";
import "../index.css";
import { ErrorBoundary } from "../shell/error-boundary";
import { preloadDetectedLocale } from "../i18n/preload-detected-locale";
import { initAutoDynamicTestIds } from "../lib/auto-testid";
import { initRemoteDiagnostics } from "@/infra/telemetry/zaraz";
import { createLogger } from "@/lib/logger";
import { loadWebOnlyBootAssets } from "@/platform/browser";
import { initAds } from "./init-ads";

const log = createLogger("MAIN");

// Detect if running in Capacitor (native app) environment
const isCapacitor = Capacitor.isNativePlatform();

// Load external web-only third-party assets (consent scripts, web fonts, AdSense).
// Native builds skip these to reduce startup/network overhead.
loadWebOnlyBootAssets();

// Initialize Sentry for error tracking (must be first)
// Web and Capacitor both use the same React SDK - native Android uses its own SDK in MainActivity.java
// DSN: anqr-web for web browser, anqr-mobile DSN is used in native Android code
Sentry.init({
  dsn: isCapacitor
    ? "https://e21ce35eef457e8b07408316ee9cb262@o4510808522489856.ingest.us.sentry.io/4510808544247808"
    : "https://4cd2d9dfc1e109caf26e9105c03cdfd6@o4510808522489856.ingest.us.sentry.io/4510808540643328",
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
    const msg = event.message || event.exception?.values?.[0]?.value || "";
    // Drop all AdMob platform mismatch errors
    if (msg.includes("is not implemented on")) return null;
    // Drop all QART diagnostic messages (sent via captureMessage from logger)
    if (msg.includes("[QART]")) return null;
    // Drop known diagnostic patterns that may not have [QART] prefix
    if (msg.includes("ECC budget exceeded")) return null;
    if (msg.includes("SEMANTIC-HARD-GATE")) return null;
    if (msg.includes("matrix scan validation")) return null;
    if (msg.includes("DECODED BYTES")) return null;
    // Drop stale cache reference errors
    if (msg.includes("Grid3x3")) return null;
    if (msg.includes("TrackerStorageType")) return null;
    if (msg.includes("ditherMode")) return null;
    return event;
  },
  // Don't send debug breadcrumbs to Sentry
  beforeBreadcrumb(breadcrumb) {
    // Filter out debug-level breadcrumbs in production
    if (breadcrumb.level === "debug" && !import.meta.env.DEV) {
      return null;
    }
    return breadcrumb;
  },
  // Session replay for web only (not available in Capacitor WebView)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: isCapacitor ? 0 : 0.5,
  // Tag environment for filtering in Sentry dashboard
  environment: isCapacitor ? "capacitor" : "web",
});

// Initialize logging system (after Sentry, so errors during init are captured)
initRemoteDiagnostics();
log.info("App starting", { environment: isCapacitor ? "capacitor" : "web" });

// Start ad initialization after DOM is ready
if (document.readyState === "complete") {
  void initAds(log);
} else {
  globalThis.addEventListener("load", () => void initAds(log), { once: true });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const appRoot = rootElement;

function renderApp(): void {
  ReactDOM.createRoot(appRoot).render(
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
    </React.StrictMode>,
  );
}

void preloadDetectedLocale().finally(renderApp);

// Ensure every interactive element has a unique dynamic test id.
initAutoDynamicTestIds();
