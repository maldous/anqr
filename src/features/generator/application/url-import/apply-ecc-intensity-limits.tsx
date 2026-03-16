import type { ShareConfig } from "@/modules/share-links";
import { useQRStore } from "@/store/qr-store";

export function applyEccIntensityLimits(params: Partial<ShareConfig>): void {
  if (params.maxOverlayIntensityL !== undefined) {
    const intensityL = params.maxOverlayIntensityL;
    useQRStore.setState((s) => ({
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
    useQRStore.setState((s) => ({
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
    useQRStore.setState((s) => ({
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
    useQRStore.setState((s) => ({
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
    useQRStore.setState((s) => ({ output: { ...s.output, gifDisposal: params.gifDisposal! } }));
}
