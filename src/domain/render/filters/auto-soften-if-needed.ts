import type { QRGeneratorConfig } from "../../../modules/qr-generator/types";
import { detectBimodalBW } from "./detect-bimodal-bw";
import { softenBWImage } from "./soften-bw-image";
import { log } from "./log";

/**
 * Preprocess image data with configured filters
 * Uses overlay module's applyFilters (canonical source) with QR config mapping
 */
export function autoSoftenIfNeeded(
  data: ImageData,
  config: QRGeneratorConfig,
  debug: boolean,
): ImageData {
  if (config.disableAutoSoften || config.qrFirstMode) return data;
  if (!detectBimodalBW(data)) return data;
  if (debug) {
    log.debug("preprocessImageData - detected high-contrast B&W, applying softening");
  }
  return softenBWImage(data);
}
