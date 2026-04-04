// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:52

import { CODEBUFF_TIMEOUT_MS } from "./codebuff-timeout-ms.mjs";

export function makeTimeout() {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Codebuff timeout after ${CODEBUFF_TIMEOUT_MS}ms`)),
      CODEBUFF_TIMEOUT_MS,
    );
  });
}
