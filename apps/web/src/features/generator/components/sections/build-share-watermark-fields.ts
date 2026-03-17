import type { StoreState } from "./share-config-store.types";

export function buildShareWatermarkFields(watermark: StoreState["watermark"]) {
  return {
    watermarkEnabled: watermark.enabled ? true : undefined,
    watermarkKind: watermark.enabled && watermark.kind !== "text" ? watermark.kind : undefined,
    watermarkText:
      watermark.enabled && watermark.kind === "text" && watermark.text ? watermark.text : undefined,
    watermarkPosition:
      watermark.enabled && watermark.position !== "center" ? watermark.position : undefined,
    watermarkOpacity: watermark.enabled && watermark.opacity !== 50 ? watermark.opacity : undefined,
    watermarkBlend: watermark.enabled && watermark.blend !== "normal" ? watermark.blend : undefined,
  };
}
