/**
 * Yield to main thread to prevent UI blocking during heavy computation
 * Uses requestIdleCallback with timeout fallback for mobile performance
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
