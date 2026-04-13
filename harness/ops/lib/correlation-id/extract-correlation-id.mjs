const HEADER_NAME = "x-anqr-correlation-id";

export function extractCorrelationId(headers) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(HEADER_NAME);
  return headers[HEADER_NAME] || headers["x-request-id"] || null;
}
