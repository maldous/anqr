// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1045

import { logInfo } from "./logger.mjs";
export async function lookupAgentInfoTool({ agentId }) {
  logInfo(`🔍 Lookup agent: ${agentId}`);
  return {
    acknowledged: true,
    agentId,
    message: "Agent lookup is handled by the parent instance",
  };
}
