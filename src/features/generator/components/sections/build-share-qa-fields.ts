import type { StoreState } from './share-config-store-state.type';

export function buildShareQaFields(qa: StoreState['qa']) {
  return {
    qaContrastCheck: qa.contrastCheck ? true : undefined,
    qaSimulateBlur: qa.simulateBlurPx === 0 ? undefined : qa.simulateBlurPx,
    qaSimulateNoise: qa.simulateNoise === 0 ? undefined : qa.simulateNoise,
    qaSimulateRotation: qa.simulateRotationDeg === 0 ? undefined : qa.simulateRotationDeg,
    qaShowHeatmap: qa.showHeatmap ? true : undefined,
  };
}
