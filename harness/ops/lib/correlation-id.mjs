import { randomUUID } from "node:crypto";

const HEADER_NAME = "x-anqr-correlation-id";

export function generateCorrelationId(prefix = "req") {
  const uuid = randomUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}-${uuid}-${Date.now().toString(36)}`;
}

export function extractCorrelationId(headers) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(HEADER_NAME);
  return headers[HEADER_NAME] || headers["x-request-id"] || null;
}

export function correlationIdFromRequest(req) {
  return extractCorrelationId(req?.headers) || generateCorrelationId();
}

