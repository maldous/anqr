// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:280

import { SYMPHONY_BRIDGE_MODEL } from "./symphony-bridge-model.mjs";
import { SYMPHONY_BRIDGE_URL } from "./symphony-bridge-url.mjs";

export function getRunnerProvider() {
  return {
    name: "symphony-bridge",
    model: SYMPHONY_BRIDGE_MODEL,
    baseUrl: SYMPHONY_BRIDGE_URL,
    apiKey: process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony",
    requiresSdk: false,
    useMaxCompletionTokens: false,
  };
}
