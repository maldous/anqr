import type { QRAutoOptions } from "./qr-auto-options.contract";
import type { QRAnimationOptions } from "./qr-animation-options.contract";
import type { QRCoreOptions } from "./qr-core-options.contract";
import type { QRMetadataOptions } from "./qr-metadata-options.contract";
import type { QROutputOptions } from "./qr-output-options.contract";
import type { QROverlayOptions } from "./qr-overlay-options.contract";
import type { QRQualityAssuranceOptions } from "./qr-quality-assurance-options.contract";
import type { QRRenderOptions } from "./qr-render-options.contract";
import type { QRSafetyOptions } from "./qr-safety-options.contract";
import type { QRWatermarkOptions } from "./qr-watermark-options.contract";

export interface QRGenerationOptions {
  qr: QRCoreOptions;
  render: QRRenderOptions;
  overlay: QROverlayOptions;
  animation: QRAnimationOptions;
  output: QROutputOptions;
  watermark: QRWatermarkOptions;
  metadata: QRMetadataOptions;
  safety: QRSafetyOptions;
  qa: QRQualityAssuranceOptions;
  auto: QRAutoOptions;
}
