export function detectDeviceRenderScaleCap(): number {
  if (typeof navigator === "undefined") return 24;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memoryGb = typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined;
  const cores =
    typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 0;

  if ((typeof memoryGb === "number" && memoryGb <= 4) || (cores > 0 && cores <= 4)) return 16;
  if ((typeof memoryGb === "number" && memoryGb <= 8) || (cores > 0 && cores <= 6)) return 20;
  return 24;
}
