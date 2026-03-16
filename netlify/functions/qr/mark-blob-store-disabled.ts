import {
  blobStoreDisabledLogged,
  setBlobStoreDisabledLogged,
} from "./blob-store-disabled-logged.const.ts";
import { setBlobStoreDisabled } from "./blob-store-disabled.const.ts";
import { qrFnLog } from "./qr-fn-log.ts";

export function markBlobStoreDisabled(reason: string): void {
  setBlobStoreDisabled(true);
  if (blobStoreDisabledLogged) return;
  setBlobStoreDisabledLogged(true);
  qrFnLog("[BLOB] cache disabled", { reason });
}
