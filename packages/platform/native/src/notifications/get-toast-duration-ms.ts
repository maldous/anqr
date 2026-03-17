import type { ToastDuration } from "./toast-duration";

export function getToastDurationMs(duration: ToastDuration): number {
  return duration === "long" ? 3200 : 1800;
}
