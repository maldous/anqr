import { getStateFile } from "./get-state-file.mjs";

export function getLockFile() {
  return `${getStateFile()}.lock`;
}
