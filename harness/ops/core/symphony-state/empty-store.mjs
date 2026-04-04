import { HOST_ID } from "./host-id.mjs";

export function emptyStore() {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    hostId: HOST_ID,
    issues: {},
    worktreeStates: {},
    global: {
      integrationQueue: [],
      integrationLock: null,
    },
  };
}
