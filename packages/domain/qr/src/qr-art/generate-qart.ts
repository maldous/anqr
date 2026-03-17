import type { QArtConfig, QArtResult } from "./types";
import { qartLog } from "./qart-log";

export function generateQArt(_config: QArtConfig): QArtResult {
  qartLog.warn("Full QArt generation not yet implemented");
  return {
    success: false,
    error:
      "QArt generation not yet implemented. Use mixed mode encoding for basic QArt URL support.",
    matchingPixels: 0,
    totalControllable: 0,
    matchPercentage: 0,
  };
}
