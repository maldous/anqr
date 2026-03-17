import { cancelledRequestIds } from "./cancelled-request-ids";

export function addCancelledRequestId(id: number): void {
  cancelledRequestIds.add(id);
}
