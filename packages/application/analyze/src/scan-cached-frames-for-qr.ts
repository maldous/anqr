import { analyzeQRCode } from "@/domain/analyze";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { buildCandidateFrameIndices } from "./build-candidate-frame-indices";
import { cloneCanvasLike } from "./clone-canvas-like";

export function scanCachedFramesForQR(
  cachedFrames: (HTMLCanvasElement | OffscreenCanvas)[],
  currentFrame: number,
): QRAnalysisResult | null {
  if (cachedFrames.length <= 1) {
    return null;
  }

  const candidateIndices = buildCandidateFrameIndices(cachedFrames.length, currentFrame);
  for (const frameIdx of candidateIndices) {
    const frame = cachedFrames[frameIdx];
    if (!frame) {
      continue;
    }

    const frameResult = analyzeQRCode(cloneCanvasLike(frame));
    if (frameResult.success) {
      const warnings = [...(frameResult.warnings ?? [])];
      warnings.push(`Analyzed using animation frame ${frameIdx + 1}/${cachedFrames.length}`);
      return { ...frameResult, warnings };
    }
  }

  return null;
}
