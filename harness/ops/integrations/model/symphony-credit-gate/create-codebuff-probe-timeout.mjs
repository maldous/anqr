import { CODEBUFF_PROBE_TIMEOUT_MS } from "./codebuff-probe-timeout-ms.mjs";

export function createCodebuffProbeTimeout() {
  let timer = null;
  return {
    race(promise) {
      return Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(
            () =>
              reject(new Error(`Codebuff probe timed out after ${CODEBUFF_PROBE_TIMEOUT_MS}ms`)),
            CODEBUFF_PROBE_TIMEOUT_MS,
          );
        }),
      ]);
    },
    clear() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}
