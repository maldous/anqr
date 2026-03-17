import {
  getBlobStoreDisabledLogged,
  setBlobStoreDisabledLogged,
} from "./blob-store-disabled-logged.const";
import { setBlobStoreDisabled } from "./blob-store-disabled.const";
import { qrFnLog } from "./qr-fn-log";

export function markBlobStoreDisabled(reason: string): void {
  setBlobStoreDisabled(true);
  if (getBlobStoreDisabledLogged()) return;
  setBlobStoreDisabledLogged(true);
  qrFnLog("[BLOB] cache disabled", { reason });
}
