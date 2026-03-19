import { withGifEncodeLock as withSharedGifEncodeLock } from "@/domain/render/animation";
import { qrFnLog } from "./qr-fn-log";

export async function withGifEncodeLock<T>(fn: () => T | Promise<T>): Promise<T> {
  return withSharedGifEncodeLock(fn, {
    onWait: (waitMs, queueDepth) => {
      if (waitMs > 10) {
        qrFnLog("[TIMING] GIF encode queue wait", {
          waitMs,
          queueDepth,
        });
      }
    },
  });
}
