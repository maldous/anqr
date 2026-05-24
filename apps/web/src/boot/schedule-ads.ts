import type { Logger } from "@/lib/logger";
import { initAds } from "./init-ads";
import { isCapacitor } from "./is-capacitor";

export function scheduleAds(log: Logger): void {
  const adsBoot = () => void initAds(log);
  if (isCapacitor) {
    globalThis.setTimeout(adsBoot, 1300);
  } else {
    adsBoot();
  }
}
