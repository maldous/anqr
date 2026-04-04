// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3802

import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";

export function providerSupportsTools(providerName) {
  if (nonToolCapableProviders.has(providerName)) return false;
  if (toolCapableProviders.has(providerName)) return true;
  // Not yet probed — optimistically allow tools; runtime safety net catches failures
  return true;
}
