import { buildHeaderAnimation } from './build-header-animation';
import { buildHeaderColors } from './build-header-colors';
import { buildHeaderOutput } from './build-header-output';
import { buildHeaderOverlay } from './build-header-overlay';
import { buildHeaderQrSettings } from './build-header-qr-settings';
import { buildHeaderSafetyQaAuto } from './build-header-safety-qa-auto';
import { buildHeaderStyles } from './build-header-styles';
import type { StoreState } from './store-state.type';

export function buildHeaderShareConfig(
  getPayloadText: () => string,
  lang: string,
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
    lang,
    ...buildHeaderQrSettings(qr, render),
    ...buildHeaderColors(render),
    ...buildHeaderStyles(render),
    ...buildHeaderOverlay(overlay),
    ...buildHeaderAnimation(animation),
    ...buildHeaderOutput(output),
    ...buildHeaderSafetyQaAuto(safety, qa, auto, watermark, metadata),
  };
}
