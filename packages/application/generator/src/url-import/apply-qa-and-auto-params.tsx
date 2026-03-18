import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type QRState } from "@/store/qr-store";

export function applyQaAndAutoParams(params: Partial<ShareConfig>): void {
  if (params.qaContrastCheck)
    useQRStore.setState((s: QRState) => ({ qa: { ...s.qa, contrastCheck: true } }));
  if (params.qaSimulateBlur !== undefined)
    useQRStore.setState((s: QRState) => ({ qa: { ...s.qa, simulateBlurPx: params.qaSimulateBlur! } }));
  if (params.qaSimulateNoise !== undefined)
    useQRStore.setState((s: QRState) => ({ qa: { ...s.qa, simulateNoise: params.qaSimulateNoise! } }));
  if (params.qaSimulateRotation !== undefined)
    useQRStore.setState((s: QRState) => ({
      qa: { ...s.qa, simulateRotationDeg: params.qaSimulateRotation! },
    }));
  if (params.qaShowHeatmap) useQRStore.setState((s: QRState) => ({ qa: { ...s.qa, showHeatmap: true } }));
  if (params.autoPickVersion === false)
    useQRStore.setState((s: QRState) => ({ auto: { ...s.auto, pickVersion: false } }));
  if (params.autoPickEcc) useQRStore.setState((s: QRState) => ({ auto: { ...s.auto, pickEcc: true } }));
  if (params.autoReduceIntensity)
    useQRStore.setState((s: QRState) => ({ auto: { ...s.auto, reduceIntensityUntilSafe: true } }));
}
