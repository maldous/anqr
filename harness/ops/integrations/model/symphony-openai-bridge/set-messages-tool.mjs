// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:935

import { logInfo } from "./logger.mjs";
export async function setMessagesTool({ messages }) {
  logInfo(`💬 Set messages: ${messages.length} messages`);
  return { acknowledged: true, count: messages.length };
}
