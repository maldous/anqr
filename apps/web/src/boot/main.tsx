import * as Sentry from "@sentry/react";
import "../index.css";
import { preloadDetectedLocale } from "../i18n/preload-detected-locale";
import { initAutoDynamicTestIds } from "../lib/auto-testid";
import { initRemoteDiagnostics } from "@/infra/telemetry/zaraz";
import { createLogger } from "@/lib/logger";
import { loadWebOnlyBootAssets } from "@/platform/browser";

import { isCapacitor } from "./is-capacitor";
import { renderApp } from "./render-app";
import { scheduleAds } from "./schedule-ads";

const log = createLogger("MAIN");

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
  // Session replay is lazy-loaded below to keep the initial Sentry vendor
  // chunk small (~100-150 KB gz saving). See review-2026-05-24 B-F3.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  // Tag environment for filtering in Sentry dashboard
  environment: isCapacitor ? "capacitor" : "web",
});

// Lazy-load Sentry Replay on web only (not available in Capacitor WebView).
// Sentry.lazyLoadIntegration fetches from Sentry's CDN at runtime, so the
// ~100-150 KB Replay code stays out of the initial bundle. Add via
// requestIdleCallback so it doesn't compete with first paint.
if (!isCapacitor && typeof globalThis.window !== "undefined") {
  const loadReplay = () => {
    void Sentry.lazyLoadIntegration("replayIntegration")
      .then((replayIntegration) => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        );
      })
      .catch((e: unknown) => log.debug("replay lazy-load failed", { e }));
  };
  if ("requestIdleCallback" in globalThis) {
    (
      globalThis as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void;
      }
    ).requestIdleCallback(loadReplay, { timeout: 5000 });
  } else {
    globalThis.setTimeout(loadReplay, 3000);
  }
}

// Initialize logging system (after Sentry, so errors during init are captured).
// In production, only attach the window.anqrDiag debug surface if the user
// has explicitly enabled it — keeps the dev-tools-only API out of the boot
// path for ~99.9 % of sessions. See review-2026-05-24 B-F9.
if (
  import.meta.env.DEV ||
  (typeof localStorage !== "undefined" && localStorage.getItem("anqrDiagEnabled") === "true")
) {
  initRemoteDiagnostics();
}
log.info("App starting", { environment: isCapacitor ? "capacitor" : "web" });

// Start ad initialization AFTER the splash has had time to dismiss, so the
// AdMob banner doesn't render on top of the launch splash. Web/desktop runs
// it immediately on load; native delays by ~1300ms (slightly more than the
// splash launchShowDuration in capacitor.config.json).
const runAdsInit = () => scheduleAds(log);
if (document.readyState === "complete") {
  runAdsInit();
} else {
  globalThis.addEventListener("load", runAdsInit, { once: true });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const appRoot = rootElement;

// Render React immediately and kick off the locale fetch in parallel.
// The top-level Suspense + react-i18next's useSuspense handle the
// "translations not yet loaded" state via the existing Loading… fallback,
// so the user sees the app shell paint as soon as JS evaluates instead of
// waiting an extra round-trip on the locale JSON. See review-2026-05-24
// B-F2. en-GB is bundled and returns synchronously from this function.
void preloadDetectedLocale();
renderApp(appRoot);

// Dismiss the native splash screen explicitly once React has rendered.
// Without this the Android system splash (Theme.SplashScreen, API 31+) and
// the Capacitor SplashScreen plugin can keep the splash on top of the WebView.
if (isCapacitor) {
  // Dynamic import so the web bundle doesn't pull in the plugin.
  void import("@capacitor/splash-screen").then(({ SplashScreen }) =>
    SplashScreen.hide().catch((e: unknown) => log.debug("splash hide failed", { e })),
  );
}

// Ensure every interactive element has a unique dynamic test id.
initAutoDynamicTestIds();

// Expose the qr-store on window for e2e tests (the permutations
// Playwright project mutates state via this global to exercise every
// module-style × dither × animation combo). The bundle cost is zero —
// useQRStore is already imported by every store consumer; this just
// adds a property assignment on the singleton. See
// tests/e2e/permutations.web.spec.ts and L10 in review-2026-05-24.
void import("../state/qr-store").then(({ useQRStore }) => {
  (globalThis as unknown as { useQRStore?: typeof useQRStore }).useQRStore = useQRStore;
});
