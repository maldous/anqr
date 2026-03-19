export function isRequestStale(
  generationRequestIdRef: { current: number },
  requestId: number,
): boolean {
  return generationRequestIdRef.current !== requestId;
}
