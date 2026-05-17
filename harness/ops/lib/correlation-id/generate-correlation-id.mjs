import { randomUUID } from "node:crypto";

export function generateCorrelationId(prefix = "req") {
  const uuid = randomUUID().replaceAll("-", "").slice(0, 16);
  return `${prefix}-${uuid}-${Date.now().toString(36)}`;
}
