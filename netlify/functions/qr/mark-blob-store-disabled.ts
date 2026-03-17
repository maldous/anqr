import { blobStoreDisabledLogged } from "./blob-store-disabled-logged.const";
import { blobStoreDisabled } from "./blob-store-disabled.const";
import { qrFnLog } from "./qr-fn-log";

export function markBlobStoreDisabled(reason: string): void {
  blobStoreDisabled.set(true);
  if (blobStoreDisabledLogged.get()) return;
  blobStoreDisabledLogged.set(true);
  qrFnLog("[BLOB] cache disabled", { reason });
}
