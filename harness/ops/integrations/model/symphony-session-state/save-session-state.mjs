import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "session-state.json";

export function saveSessionState(state) {
  // Callers that do read-modify-write wrap the entire operation in withBridgeLock,
  // so saveBridgeFile must NOT re-acquire the lock here (deadlock risk).
  // Atomic rename via saveBridgeFile is sufficient for crash safety.
  saveBridgeFile(FILE_NAME, state);
}
