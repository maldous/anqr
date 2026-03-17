import type { ShareConfig } from "@/modules/share-links";
import { useQRStore } from "@/store/qr-store";

export function applyQaAndAutoParams(params: Partial<ShareConfig>): void {
  if (params.qaContrastCheck)
    useQRStore.setState((s) => ({ qa: { ...s.qa, contrastCheck: true } }));
  if (params.qaSimulateBlur !== undefined)
    useQRStore.setState((s) => ({ qa: { ...s.qa, simulateBlurPx: params.qaSimulateBlur! } }));
  if (params.qaSimulateNoise !== undefined)
    useQRStore.setState((s) => ({ qa: { ...s.qa, simulateNoise: params.qaSimulateNoise! } }));
  if (params.qaSimulateRotation !== undefined)
    useQRStore.setState((s) => ({
      qa: { ...s.qa, simulateRotationDeg: params.qaSimulateRotation! },
    }));
  if (params.qaShowHeatmap) useQRStore.setState((s) => ({ qa: { ...s.qa, showHeatmap: true } }));
  if (params.autoPickVersion === false)
    useQRStore.setState((s) => ({ auto: { ...s.auto, pickVersion: false } }));
  if (params.autoPickEcc) useQRStore.setState((s) => ({ auto: { ...s.auto, pickEcc: true } }));
  if (params.autoReduceIntensity)
    useQRStore.setState((s) => ({ auto: { ...s.auto, reduceIntensityUntilSafe: true } }));
}
