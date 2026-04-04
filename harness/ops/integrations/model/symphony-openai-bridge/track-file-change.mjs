// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:372

import { activeRequests } from "./active-requests.mjs";

export function trackFileChange(requestId) {
  const req = activeRequests.get(requestId);
  if (req) {
    req.filesChanged = (req.filesChanged || 0) + 1;
  }
}
