/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Process and post-process a single animation frame.
 */

import { processAnimationFrameLoopIteration } from "@/features/generator/application/frames/frames-fn-loopiter";
import { applyFramePostProcessing } from "@/features/generator/application/frames/frames-fn-postprocess";
import { drawToDisplayCanvas } from "@/features/generator/application/generation/generation-fn-drawtodisplay";
import type { FramePostProcessContext } from "./frame-post-process-context.type";
import type { FrameRenderContext } from "./frame-render-context.type";

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
