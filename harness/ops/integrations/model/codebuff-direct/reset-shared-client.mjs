import { setSharedClient } from "./shared-client.mjs";
import { setSharedClientKey } from "./shared-client-key.mjs";

export function resetSharedClient() {
  setSharedClient(null);
  setSharedClientKey(null);
}
