import { buildShareAnimation } from './build-share-animation';
import { buildShareColors } from './build-share-colors';
import { buildShareOutput } from './build-share-output';
import { buildShareOverlay } from './build-share-overlay';
import { buildShareQRSettings } from './build-share-qr-settings';
import { buildShareSafetyQaAuto } from './build-share-safety-qa-auto';
import { buildShareStyles } from './build-share-styles';
import type { StoreState } from './share-config-store-state.type';

export function buildShareConfig(
  getPayloadText: () => string,
  qr: StoreState['qr'],
  render: StoreState['render'],
  overlay: StoreState['overlay'],
  animation: StoreState['animation'],
  output: StoreState['output'],
  safety: StoreState['safety'],
  qa: StoreState['qa'],
  auto: StoreState['auto'],
  watermark: StoreState['watermark'],
  metadata: StoreState['metadata']
) {
  return {
    data: getPayloadText(),
    ...buildShareQRSettings(qr, render),
    ...buildShareColors(render),
    ...buildShareStyles(render),
    ...buildShareOverlay(overlay),
    ...buildShareAnimation(animation),
    ...buildShareOutput(output),
    ...buildShareSafetyQaAuto(safety, qa, auto, watermark, metadata),
  };
}
