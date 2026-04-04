// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:951

import { logInfo } from "./logger.mjs";
export async function skillTool({ name }) {
  logInfo(`📚 Load skill: ${name}`);
  return {
    acknowledged: true,
    skill: name,
    message: "Skill loading is handled by the parent instance",
  };
}
