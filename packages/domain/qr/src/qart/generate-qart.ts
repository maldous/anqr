import type { QArtConfig } from "./qart-config";
import type { QArtResult } from "./qart-result";
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
