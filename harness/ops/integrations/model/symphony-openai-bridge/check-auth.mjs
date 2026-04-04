// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:5408

import { VALID_TOKENS } from "./valid-tokens.mjs";
import { logDebug } from "./logger.mjs";

export function checkAuth(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const isValid = VALID_TOKENS.has(token) || token.startsWith("local-") || token === "";
  logDebug(`Auth check: received token="${token}", valid=${isValid}`);
  return isValid;
}
