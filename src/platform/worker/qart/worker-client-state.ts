import type { PendingRequest } from "./pending-request.type";

export const workerClientState = {
  worker: null as Worker | null,
  workerFailed: false,
  nextId: 0,
  pending: new Map<number, PendingRequest>(),
};
