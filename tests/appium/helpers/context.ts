/**
 * Appium Context Switching Helpers
 *
 * ANQR is a Capacitor hybrid app — the UI lives in a WebView.
 * Appium starts in NATIVE_APP context; most interactions require
 * switching to the WEBVIEW context first.
 *
 * Context names:
 *   NATIVE_APP           — Android/iOS native layer (system dialogs, permissions)
 *   WEBVIEW_link.anqr.app — Capacitor WebView containing the React app
 */

const WEBVIEW_PREFIX = 'WEBVIEW_';
const NATIVE_CONTEXT = 'NATIVE_APP';
const MAX_RETRIES = 20;
const RETRY_INTERVAL_MS = 1000;

/**
 * Wait for the WebView context to become available, then switch to it.
 * The WebView may take a few seconds to initialize after app launch.
 */
export async function switchToWebView(): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const contexts = await browser.getContexts();
    const webview = contexts.find(
      (ctx) => typeof ctx === 'string' && ctx.startsWith(WEBVIEW_PREFIX)
    );
    if (webview && typeof webview === 'string') {
      await browser.switchContext(webview);
      return webview;
    }
    await browser.pause(RETRY_INTERVAL_MS);
  }
  throw new Error(
    `WebView context not found after ${MAX_RETRIES * RETRY_INTERVAL_MS}ms. ` +
      `Available contexts: ${JSON.stringify(await browser.getContexts())}`
  );
}

/**
 * Switch back to the native app context.
 */
export async function switchToNative(): Promise<void> {
  await browser.switchContext(NATIVE_CONTEXT);
}

/**
 * Get the current context name.
 */
export async function getCurrentContext(): Promise<string> {
  return (await browser.getContext()) as string;
}

/**
 * Check if the current context is a WebView.
 */
export async function isInWebView(): Promise<boolean> {
  const ctx = await getCurrentContext();
  return ctx.startsWith(WEBVIEW_PREFIX);
}
