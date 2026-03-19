import type { ShareConfig } from "@/contracts/share";
import type { SafetyMode } from "@/contracts/generator";
import type { UrlImportStore } from "./store-contract.types";

export function applySafetyParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.safetyMode)
    store.patchState((s) => ({
      safety: { ...s.safety, mode: params.safetyMode as SafetyMode },
    }));
  if (params.safetyMinModulePx !== undefined)
    store.patchState((s) => ({
      safety: { ...s.safety, minModulePx: params.safetyMinModulePx! },
    }));
  if (params.safetyMinQuietZone !== undefined)
    store.patchState((s) => ({
      safety: { ...s.safety, minQuietZoneModules: params.safetyMinQuietZone! },
    }));
  if (params.lockFinders === false)
    store.patchState((s) => ({ safety: { ...s.safety, lockFinders: false } }));
  if (params.lockTiming === false)
    store.patchState((s) => ({ safety: { ...s.safety, lockTiming: false } }));
  if (params.lockAlign === false)
    store.patchState((s) => ({ safety: { ...s.safety, lockAlign: false } }));
  if (params.lockFormat === false)
    store.patchState((s) => ({ safety: { ...s.safety, lockFormat: false } }));
  if (params.lockVersion === false)
    store.patchState((s) => ({ safety: { ...s.safety, lockVersion: false } }));
}
