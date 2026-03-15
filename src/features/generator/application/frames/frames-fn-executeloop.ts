/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Execute the main frame generation loop.
 */

import { createLogger } from '@/infra/logging/logger';
// eslint-disable-next-line no-restricted-imports -- Sub-path import required to avoid circular dependency through barrel
import { canvasHashCache } from '@/modules/qr-generator/cache';
import { processAndPostProcessFrame } from '@/features/generator/application/frames/frames-fn-processframe';
import type { ExecuteFrameGenerationLoopParams } from './execute-frame-generation-loop-params.type';

const log = createLogger('QR');

export async function executeFrameGenerationLoop<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: ExecuteFrameGenerationLoopParams<W>): Promise<void> {
  for (let frameIdx = 0; frameIdx < params.framesToProcess.length; frameIdx++) {
    const frame = params.framesToProcess[frameIdx];
    params.updateGenerationProgress(
      params.t('preview.busy.renderingAnimationFrames', 'Rendering the animation frames...'),
      10 + ((frameIdx + 1) / Math.max(1, params.framesToProcess.length)) * 78
    );
    if (params.isRunCancelled()) return;

    if (params.gifCompositor?.canvas instanceof HTMLCanvasElement) {
      canvasHashCache.delete(params.gifCompositor.canvas);
    }

    if (await params.yieldCtrl.yieldIfNeeded()) {
      if (params.isRunCancelled()) return;
    }

    try {
      await processAndPostProcessFrame({
        ...params,
        frame,
        frameIdx,
        framesToProcessLength: params.framesToProcess.length,
      });
    } catch (err) {
      log.error('Error generating frame', { error: err });
    }
  }
}
