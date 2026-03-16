import { type Canvas } from "@napi-rs/canvas";
import { WatermarkKind } from "./watermark-kind.types";
import { fetchImageAsCanvas } from "./fetch-image-as-canvas";

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
