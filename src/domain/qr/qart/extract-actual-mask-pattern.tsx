import type { ECCLevel } from "./bit-mapping";
import { eccNumericToLevel, extractMaskFromMatrix } from "./validation";
import { log } from "./log";

export function extractActualMaskPattern(
  qr: { isDark: (row: number, col: number) => boolean },
  moduleCount: number,
  ecc: ECCLevel,
  maskPattern: number,
): number {
  if (maskPattern >= 0) return maskPattern;

  const tempMatrix: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    tempMatrix[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      tempMatrix[r][c] = qr.isDark(r, c);
    }
  }

  const extracted = extractMaskFromMatrix(tempMatrix);
  const actualMask = extracted.mask;

  const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);
  if (extractedEccLevel !== ecc) {
    log.warn("FORMAT_PARSER_DISAGREEMENT: Decoder extracted different ECC than requested", {
      requested: ecc,
      extracted: extractedEccLevel,
      extractedNumeric: extracted.eccLevel,
      action: "CONTINUE_WITH_ENCODER_ECC",
      note: "Encoder-requested ECC is authoritative. Final scan validates correctness.",
    });
  }

  log.info("Extracted actual mask from encoder (auto-mask mode)", {
    extractedMask: actualMask,
    extractedEcc: extractedEccLevel,
    formatInfoValid: extracted.isValid,
    formatInfoMatch: extracted.formatInfoMatch,
    eccParserAgreement: extractedEccLevel === ecc,
  });

  return actualMask;
}
