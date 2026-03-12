/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Yield to main thread for UI responsiveness.
 */

export function yieldToMainThread(timeout = 50): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'undefined') {
      // Fallback for browsers without requestIdleCallback
      setTimeout(resolve, 0);
    } else {
      requestIdleCallback(() => resolve(), { timeout });
    }
  });
}

