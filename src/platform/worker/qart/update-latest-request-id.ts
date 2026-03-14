import { latestRequestIdState } from './latest-request-id-state';

export function updateLatestRequestId(id: number): void {
  latestRequestIdState.value = Math.max(latestRequestIdState.value, id);
}
