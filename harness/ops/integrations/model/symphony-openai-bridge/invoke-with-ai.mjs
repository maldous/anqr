// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:4146

import { invokeWithAIInner } from "./invoke-with-aiinner.mjs";
import { withRequestCwd } from "./with-request-cwd.mjs";

export async function invokeWithAI(provider, messages, options = {}) {
  return withRequestCwd(options.cwd, () => invokeWithAIInner(provider, messages, options));
}
