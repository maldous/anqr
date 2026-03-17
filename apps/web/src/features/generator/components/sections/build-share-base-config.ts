import type { BuildShareConfigInput } from "./build-share-config-input.types";
import { buildShareAnimation } from "./build-share-animation";
import { buildShareColors } from "./build-share-colors";
import { buildShareOutput } from "./build-share-output";
import { buildShareOverlay } from "./build-share-overlay";
import { buildShareQRSettings } from "./build-share-qr-settings";
import { buildShareSafetyQaAuto } from "./build-share-safety-qa-auto";
import { buildShareStyles } from "./build-share-styles";

export function buildShareBaseConfig(params: BuildShareConfigInput) {
  return {
    data: params.getPayloadText(),
    ...buildShareQRSettings(params.qr, params.render),
    ...buildShareColors(params.render),
    ...buildShareStyles(params.render),
    ...buildShareOverlay(params.overlay),
    ...buildShareAnimation(params.animation),
    ...buildShareOutput(params.output),
    ...buildShareSafetyQaAuto(
      params.safety,
      params.qa,
      params.auto,
      params.watermark,
      params.metadata,
    ),
  };
}
