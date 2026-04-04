// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:91

import { sharedClient, setSharedClient } from "./shared-client.mjs";
import { sharedClientKey, setSharedClientKey } from "./shared-client-key.mjs";

export function resetSharedClient() {
  setSharedClient(null);
  setSharedClientKey(null);
}
