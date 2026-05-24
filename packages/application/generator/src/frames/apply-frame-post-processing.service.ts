/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply post-processing to animation frame.
 */

import { applyColorCycle } from "@/domain/render/animation";
import type { PatternEffect } from "./frames-patterneffect.types";
import { applyWatermarkToCanvas } from "../generation/apply-watermark-to-canvas.service";

export async function applyFramePostProcessing<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
  result: HTMLCanvasElement | OffscreenCanvas;
  shouldGenerateBaseAnimation: boolean;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number,
  ) => HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  framesToProcessLength: number;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
}): Promise<HTMLCanvasElement | OffscreenCanvas> {
  let finalResult: HTMLCanvasElement | OffscreenCanvas = params.result;
  if (!params.shouldGenerateBaseAnimation && params.resultPatternEffects.length > 0) {
    finalResult = params.applyResultEphemeral(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength,
    );
  }
  if (params.hasColorCycle) {
    // Don't pre-clone — applyColorCycle's resolveEffectTargetCanvas already
    // allocates an OffscreenCanvas (or HTMLCanvas fallback) and copies once.
    // The previous code did clone + then color-cycle internal copy = 2
    // drawImage calls per animated frame. See review-2026-05-24 A-F4.
    finalResult = applyColorCycle(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength,
    );
  }
  let previewFrame: HTMLCanvasElement | OffscreenCanvas = finalResult;
  if (params.watermarkConfig.enabled) {
    previewFrame = await applyWatermarkToCanvas(finalResult, params.watermarkConfig);
  }
  return previewFrame;
}
