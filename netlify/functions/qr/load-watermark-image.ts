import { type Canvas } from "@napi-rs/canvas";
import { WatermarkKind } from "./watermark-kind.types.ts";
import { fetchImageAsCanvas } from "./fetch-image-as-canvas.ts";

export async function loadWatermarkImage(
  watermarkEnabled: boolean,
  watermarkKind: WatermarkKind,
  watermarkImageUrl: string | undefined,
): Promise<Canvas | null> {
  if (
    watermarkEnabled &&
    (watermarkKind === "image" || watermarkKind === "pattern") &&
    watermarkImageUrl
  ) {
    return fetchImageAsCanvas(watermarkImageUrl);
  }
  return null;
}
