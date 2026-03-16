import { cancelledRequestIds } from "./cancelled-request-ids";

export function clearCancelledRequestId(id: number): void {
  cancelledRequestIds.delete(id);
}
