import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { normalizeRequestCwd } from "./normalize-request-cwd.mjs";
import { requestCwdStorage } from "./request-cwd-storage.mjs";

export function getCurrentRequestCwd() {
  return requestCwdStorage.getStore()?.cwd || normalizeRequestCwd(BRIDGE_ROOT);
}
