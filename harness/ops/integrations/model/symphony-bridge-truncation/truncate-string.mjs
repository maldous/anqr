// Generated from ../../../../scripts/ops/integrations/model/symphony-bridge-truncation.mjs:109

import { MESSAGE_TRUNCATION_MARKER } from "./message-truncation-marker.mjs";

export function truncateString(str, maxChars) {
  if (!str || str.length <= maxChars) return str;
  return str.slice(0, maxChars) + MESSAGE_TRUNCATION_MARKER;
}
