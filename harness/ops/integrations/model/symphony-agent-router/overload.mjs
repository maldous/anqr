// Generated from ../../../../scripts/ops/integrations/model/symphony-agent-router.mjs:95

import { json } from "./json.mjs";

export function overload(res) {
  json(res, 429, {
    error: {
      message: "Symphony agent is at concurrent capacity. Please retry shortly.",
      type: "overloaded",
    },
  });
}
