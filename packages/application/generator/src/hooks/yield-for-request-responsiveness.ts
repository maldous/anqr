import { isRequestStale } from "./is-request-stale";

export async function yieldForRequestResponsiveness(
  generationRequestIdRef: { current: number },
  requestId: number,
  yieldToMainThread: (ms?: number) => Promise<void>,
): Promise<boolean> {
  await yieldToMainThread(16);
  return isRequestStale(generationRequestIdRef, requestId);
}
