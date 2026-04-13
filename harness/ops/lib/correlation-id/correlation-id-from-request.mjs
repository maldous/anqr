import { extractCorrelationId } from "./extract-correlation-id.mjs";
import { generateCorrelationId } from "./generate-correlation-id.mjs";

export function correlationIdFromRequest(req) {
  return extractCorrelationId(req?.headers) || generateCorrelationId();
}
