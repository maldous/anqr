import { DEVICE_RENDER_SCALE_CAP } from "./device-render-scale-cap.const";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

export function getScaleFactor(overlayMode: string | undefined, config: QRGeneratorConfig): number {
  const isFastPreview = config.fastPreview === true;
  const configuredMinScale = config.renderScaleMinimum ?? 12;
  const configuredRenderScale = Math.round(config.renderScalePerModule ?? 18);
  const requestedMinScale = isFastPreview ? Math.min(configuredMinScale, 8) : configuredMinScale;
  const requestedMaxScale = isFastPreview ? 12 : 24;
  const deviceMaxScale = isFastPreview
    ? Math.min(DEVICE_RENDER_SCALE_CAP, requestedMaxScale)
    : DEVICE_RENDER_SCALE_CAP;
  const maxScale = Math.max(1, Math.min(requestedMaxScale, deviceMaxScale));
  const minScale = Math.max(1, Math.min(requestedMinScale, maxScale));
  const targetScale = isFastPreview
    ? Math.round((configuredRenderScale + minScale) * 0.58)
    : configuredRenderScale;
  const renderScale = Math.max(minScale, Math.min(maxScale, targetScale));

  switch (overlayMode) {
    case "dithered":
    case "blue-noise":
    case "blue_noise":
      return renderScale;
    case "subpixel":
    case "subpixel-size":
      return config.subpixelGrid ?? 3;
    default:
      return config.forceScaledOverlay ? renderScale : 1;
  }
}
