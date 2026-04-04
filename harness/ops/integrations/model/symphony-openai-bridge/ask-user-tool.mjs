// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1033

import { logInfo } from "./logger.mjs";
export async function askUserTool({ questions }) {
  logInfo(`❓ Ask user: ${questions.length} questions`);
  return {
    acknowledged: true,
    message: "User interaction is handled by the parent Codebuff/OpenClaw instance",
    questions: questions.length,
  };
}
