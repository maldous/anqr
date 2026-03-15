/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Finalize animation frames with watermark and validation.
 */

import { ensureDecodableFirstFrameHelper } from '@/features/generator/application/frames/frames-fn-ensuredecodable';
import { applyInterpolationToFrames } from '@/features/generator/application/frames/frames-fn-interpolation';

export async function finalizeAnimationFrames(params: {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  hasInterpolation: boolean;
  interpolateMode: string;
  content: string | undefined;
  isRunCancelled: () => boolean;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<(HTMLCanvasElement | OffscreenCanvas)[]> {
  let frames = params.frames;
  if (params.hasInterpolation && frames.length > 1) {
    params.updateGenerationProgress(
      params.t('preview.busy.smoothingAnimationFrames', 'Smoothing the animation frames...'),
      92
    );
    frames = await applyInterpolationToFrames(frames, params.interpolateMode);
  }
  if (frames.length > 1 && params.content) {
    params.updateGenerationProgress(
      params.t(
        'preview.busy.finalizingFirstAnimationFrame',
        'Finalizing the first animation frame...'
      ),
      96
    );
    await ensureDecodableFirstFrameHelper(frames, params.content);
  }
  return frames;
}
