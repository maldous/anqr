/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Process and post-process a single animation frame.
 */

import { processAnimationFrameLoopIteration } from "./process-animation-frame-loop-iteration.service";
import { applyFramePostProcessing } from "./apply-frame-post-processing.service";
import { drawToDisplayCanvas } from "../generation/draw-to-display-canvas.service";
import type { FramePostProcessContext } from "./frame-post-process-context.types";
import type { FrameRenderContext } from "./frame-render-context.types";

export async function processAndPostProcessFrame<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: FrameRenderContext & FramePostProcessContext<W>): Promise<void> {
  const result = await processAnimationFrameLoopIteration(params);

  if (params.isRunCancelled()) return;

  if (result) {
    const previewFrame = await applyFramePostProcessing({
      result,
      shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
      resultPatternEffects: params.resultPatternEffects,
      applyResultEphemeral: params.applyResultEphemeral,
      frameIdx: params.frameIdx,
      framesToProcessLength: params.framesToProcessLength,
      hasColorCycle: params.hasColorCycle,
      watermarkConfig: params.watermarkConfig,
      watermarkImage: params.watermarkImage,
    });

    params.persistFrameCanvas(previewFrame);
    if (params.isRunCancelled()) return;

    const latestStoredFrame = params.getLatestFrame() ?? previewFrame;
    params.setCanvas(latestStoredFrame);
    if (params.canvasRef.current) {
      drawToDisplayCanvas(params.canvasRef.current, latestStoredFrame);
    }
  }
}
