import { getHeaderValue } from "./get-header-value.mjs";

export function parseHeaderInt(headers, key) {
  const val = getHeaderValue(headers, key);
  if (val === null) return null;
  const parsed = Number.parseInt(val, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
