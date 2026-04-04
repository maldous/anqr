import { normalizeRequestCwd } from "./normalize-request-cwd.mjs";
import { requestCwdStorage } from "./request-cwd-storage.mjs";

export function withRequestCwd(cwd, fn) {
  return requestCwdStorage.run({ cwd: normalizeRequestCwd(cwd) }, fn);
}
