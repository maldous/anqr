import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyQaAndAutoParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.qaContrastCheck) store.patchState((s) => ({ qa: { ...s.qa, contrastCheck: true } }));
  if (params.qaSimulateBlur !== undefined)
    store.patchState((s) => ({
      qa: { ...s.qa, simulateBlurPx: params.qaSimulateBlur! },
    }));
  if (params.qaSimulateNoise !== undefined)
    store.patchState((s) => ({
      qa: { ...s.qa, simulateNoise: params.qaSimulateNoise! },
    }));
  if (params.qaSimulateRotation !== undefined)
    store.patchState((s) => ({
      qa: { ...s.qa, simulateRotationDeg: params.qaSimulateRotation! },
    }));
  if (params.qaShowHeatmap) store.patchState((s) => ({ qa: { ...s.qa, showHeatmap: true } }));
  if (params.autoPickVersion === false)
    store.patchState((s) => ({ auto: { ...s.auto, pickVersion: false } }));
  if (params.autoPickEcc) store.patchState((s) => ({ auto: { ...s.auto, pickEcc: true } }));
  if (params.autoReduceIntensity)
    store.patchState((s) => ({ auto: { ...s.auto, reduceIntensityUntilSafe: true } }));
}
