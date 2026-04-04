// Generated from ../../../scripts/ops/core/symphony-state.mjs:31

import { getStateFile } from "./get-state-file.mjs";

export function getLockFile() {
  return `${getStateFile()}.lock`;
}
