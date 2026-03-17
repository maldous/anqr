import { cancelledRequestIds } from "./cancelled-request-ids";
import { latestRequestIdState } from "./latest-request-id-state";

export function isCancelledOrStale(id: number): boolean {
  return cancelledRequestIds.has(id) || latestRequestIdState.value !== id;
}
