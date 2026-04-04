// Generated from ../../../../scripts/ops/integrations/model/discord-request-router.mjs:162

import { MAX_CONCURRENT } from "./max-concurrent.mjs";
import { globalActiveRequests } from "./global-active-requests.mjs";

export function isOverloaded() {
  return globalActiveRequests >= MAX_CONCURRENT;
}
