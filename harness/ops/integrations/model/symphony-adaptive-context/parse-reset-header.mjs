// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:202

import { getHeaderValue } from "./get-header-value.mjs";

export function parseResetHeader(headers, key) {
  const val = getHeaderValue(headers, key);
  if (!val) return null;
  const secondsMatch = val.match(/(\\d+\\.?\\d*)s/);
  const minutesMatch = val.match(/(\\d+\\.?\\d*)m/);
  let ms = 0;
  if (minutesMatch) ms += Number.parseFloat(minutesMatch[1]) * 60_000;
  if (secondsMatch) ms += Number.parseFloat(secondsMatch[1]) * 1_000;
  if (ms > 0) return Date.now() + ms;
  const seconds = Number.parseFloat(val);
  if (!Number.isNaN(seconds)) return Date.now() + seconds * 1_000;
  return null;
}
