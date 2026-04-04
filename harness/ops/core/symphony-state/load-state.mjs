import fs from "node:fs";

import { HOST_ID } from "./host-id.mjs";
import { emptyStore } from "./empty-store.mjs";
import { getStateFile } from "./get-state-file.mjs";
import { normalizeRecord } from "./normalize-record.mjs";

export function loadState() {
  try {
    const stateFile = getStateFile();
    const data = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    const store = emptyStore();
    store.version = data.version || 1;
    store.updatedAt = data.updatedAt || store.updatedAt;
    store.hostId = data.hostId || HOST_ID;
    store.global = {
      integrationQueue: [],
      integrationLock: null,
      ...data.global,
    };
    store.issues = {};
    for (const [key, value] of Object.entries(data.issues || {})) {
      store.issues[key] = normalizeRecord({ ...value, issueIdentifier: key });
    }
    store.worktreeStates = data.worktreeStates || {};
    return store;
  } catch {
    return emptyStore();
  }
}
