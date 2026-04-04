import { logInfo } from "./logger.mjs";
export async function thinkDeeplyTool({ thought }) {
  // Log the thinking for observability
  logInfo(`💭 Deep thinking: ${thought.slice(0, 200)}`);
  return { acknowledged: true, thought };
}
