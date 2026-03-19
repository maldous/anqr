import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyEccIntensityLimits(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.maxOverlayIntensityL !== undefined) {
    const intensityL = params.maxOverlayIntensityL;
    store.patchState((s) => ({
      safety: {
        ...s.safety,
        maxOverlayIntensityByEcc: {
          ...s.safety.maxOverlayIntensityByEcc,
          L: intensityL,
        },
      },
    }));
  }
  if (params.maxOverlayIntensityM !== undefined) {
    const intensityM = params.maxOverlayIntensityM;
    store.patchState((s) => ({
      safety: {
        ...s.safety,
        maxOverlayIntensityByEcc: {
          ...s.safety.maxOverlayIntensityByEcc,
          M: intensityM,
        },
      },
    }));
  }
  if (params.maxOverlayIntensityQ !== undefined) {
    const intensityQ = params.maxOverlayIntensityQ;
    store.patchState((s) => ({
      safety: {
        ...s.safety,
        maxOverlayIntensityByEcc: {
          ...s.safety.maxOverlayIntensityByEcc,
          Q: intensityQ,
        },
      },
    }));
  }
  if (params.maxOverlayIntensityH !== undefined) {
    const intensityH = params.maxOverlayIntensityH;
    store.patchState((s) => ({
      safety: {
        ...s.safety,
        maxOverlayIntensityByEcc: {
          ...s.safety.maxOverlayIntensityByEcc,
          H: intensityH,
        },
      },
    }));
  }
  if (params.gifDisposal)
    store.patchState((s) => ({
      output: { ...s.output, gifDisposal: params.gifDisposal! },
    }));
}
