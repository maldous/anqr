import { analyzeQRCode, type QRAnalysisResult } from "@/modules/qr-analyzer";
import {
  cloneCanvasLike,
  scanCachedFramesForQR,
  waitForAnimationReady,
  waitMs,
} from "./canvas-analysis-helpers";

export async function analyzeGeneratorCanvasRobustImpl(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
): Promise<QRAnalysisResult> {
  const currentFrameResult = analyzeQRCode(cloneCanvasLike(sourceCanvas));
  if (currentFrameResult.success) return currentFrameResult;

  let animationState = globalThis.__ANQR_STATE__;
  const isAnimatedSource = (animationState?.animationFrameCount ?? 0) > 1;
  if (isAnimatedSource && !animationState?.isAnimationReady) {
    animationState = await waitForAnimationReady(8);
  }

  const cachedFrames =
    animationState?.isAnimationReady && Array.isArray(animationState.animationFrames)
      ? animationState.animationFrames
      : [];

  const frameResult = scanCachedFramesForQR(cachedFrames, animationState?.currentFrame ?? 0);
  if (frameResult) return frameResult;

  if (isAnimatedSource) {
    await waitMs(90);
    const retryResult = analyzeQRCode(cloneCanvasLike(sourceCanvas));
    if (retryResult.success) {
      const warnings = [...(retryResult.warnings ?? [])];
      warnings.push("Analyzed using live animation frame retry");
      return { ...retryResult, warnings };
    }
  }

  return currentFrameResult;
}
