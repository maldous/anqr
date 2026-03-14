export function waitForAnimationReady(
  maxRetries: number
): Promise<typeof globalThis.__ANQR_STATE__> {
  return new Promise((resolve) => {
    let attempts = 0;

    const check = () => {
      const state = globalThis.__ANQR_STATE__;
      if (state?.isAnimationReady || attempts >= maxRetries) {
        resolve(state);
        return;
      }

      attempts += 1;
      setTimeout(check, 75);
    };

    check();
  });
}
