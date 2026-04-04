import { logInfo } from "./logger.mjs";
export async function lookupAgentInfoTool({ agentId }) {
  logInfo(`🔍 Lookup agent: ${agentId}`);
  return {
    acknowledged: true,
    agentId,
    message: "Agent lookup is handled by the parent instance",
  };
}
