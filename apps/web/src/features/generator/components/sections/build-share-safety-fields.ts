import type { StoreState } from "./share-config-store.types";

export function buildShareSafetyFields(safety: StoreState["safety"]) {
  const enabled = safety.mode !== "off";
  return {
    safetyMode: enabled ? safety.mode : undefined,
    safetyMinModulePx: enabled && safety.minModulePx !== 2 ? safety.minModulePx : undefined,
    safetyMinQuietZone:
      enabled && safety.minQuietZoneModules !== 4 ? safety.minQuietZoneModules : undefined,
    lockFinders: enabled && !safety.lockFinders ? false : undefined,
    lockTiming: enabled && !safety.lockTiming ? false : undefined,
    lockAlign: enabled && !safety.lockAlign ? false : undefined,
    lockFormat: enabled && !safety.lockFormat ? false : undefined,
    lockVersion: enabled && !safety.lockVersion ? false : undefined,
  };
}
