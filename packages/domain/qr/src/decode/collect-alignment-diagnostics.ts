import { createLogger } from "../../../../observability/logging/src";
import { getAlignmentPatternCenters } from "@/modules/qr-spec";
import { overlapsFinderRegion } from "./overlaps-finder-region";
import { scoreAlignmentCenter } from "./score-alignment-center";

const qrDecoderLog = createLogger("DECODER");

export function collectAlignmentDiagnostics(
  rawMatrix: boolean[][],
  moduleCount: number,
  versionRounded: number,
): void {
  const centers = getAlignmentPatternCenters(versionRounded, moduleCount);
  const alignmentScores: Array<{ center: string; score: string; mismatches: string[] }> = [];
  for (const center of centers) {
    const cx = center.col;
    const cy = center.row;
    if (overlapsFinderRegion(cx, cy, moduleCount)) continue;

    const { good, total, mismatches } = scoreAlignmentCenter(rawMatrix, cx, cy);
    alignmentScores.push({
      center: `(${cx},${cy})`,
      score: `${good}/${total}`,
      mismatches,
    });
  }
  if (alignmentScores.length) {
    qrDecoderLog.trace("diag: Alignment pattern scores", {
      version: versionRounded,
      scores: alignmentScores,
    });
  } else {
    qrDecoderLog.trace("diag: Alignment pattern scores", {
      version: versionRounded,
      scores: "none (v1 or finder-overlap only)",
    });
  }
}
