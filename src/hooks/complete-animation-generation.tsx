import { log } from './log';
import { drawToDisplayCanvas } from './draw-to-display-canvas';

export function completeAnimationGeneration(params: {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  isRunCancelled: () => boolean;
  replaceAnimationFrames: (frames: (HTMLCanvasElement | OffscreenCanvas)[]) => void;
  setIsAnimationCacheReady: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsLoadingOverlay: (v: boolean) => void;
  clearGenerationProgress: () => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: { current: HTMLCanvasElement | null };
}): void {
  if (params.isRunCancelled()) return;

  log.debug('animation cache: complete', {
    totalFrames: params.frames.length,
    firstFrameSize: params.frames[0]
      ? { w: params.frames[0].width, h: params.frames[0].height }
      : null,
  });

  params.replaceAnimationFrames(params.frames);
  params.setIsAnimationCacheReady(true);
  params.setIsLoading(false);
  params.setIsLoadingOverlay(false);
  params.clearGenerationProgress();

  if (params.frames.length > 0) {
    params.setCanvas(params.frames[0]);
    if (params.canvasRef.current) {
      drawToDisplayCanvas(params.canvasRef.current, params.frames[0]);
    }
  }
}
