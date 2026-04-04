import { logInfo } from "./logger.mjs";
export async function spawnAgentsTool({ agents }) {
  // Symphony bridge doesn't support spawning sub-agents
  // Log the request and return acknowledgment
  logInfo(`🤖 Agent spawn requested: ${agents.map((a) => a.agent_type).join(", ")}`);
  return {
    acknowledged: true,
    message: "Agent spawning is handled by the parent Codebuff/OpenClaw instance",
    agents: agents.map((a) => ({ type: a.agent_type, status: "delegated" })),
  };
}
