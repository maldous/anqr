// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:5381

import { sendJson } from "./send-json.mjs";

export function unauthorized(res) {
  sendJson(res, 401, {
    error: { message: "Unauthorized", type: "invalid_request_error" },
  });
}
