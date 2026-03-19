import type { WatermarkBlend } from "./watermark.types";

type BlendTarget = {
  globalCompositeOperation: string;
};

export function setGlobalBlendMode(target: BlendTarget, blend: WatermarkBlend): void {
  switch (blend) {
    case "multiply":
      target.globalCompositeOperation = "multiply";
      break;
    case "screen":
      target.globalCompositeOperation = "screen";
      break;
    case "overlay":
      target.globalCompositeOperation = "overlay";
      break;
    case "soft-light":
      target.globalCompositeOperation = "soft-light";
      break;
    default:
      target.globalCompositeOperation = "source-over";
      break;
  }
}
