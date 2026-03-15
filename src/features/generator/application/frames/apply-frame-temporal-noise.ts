import {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  type TemporalDitherMode,
} from '@/domain/render/dither/temporal';

export function applyFrameTemporalNoise(params: {
  animationSeed: number;
  frame: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  getTemporalScratch: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  temporalMode: TemporalDitherMode;
}) {
  const temporalOffset = calculateTemporalOffset(
    params.frameIdx,
    params.temporalMode,
    params.animationSeed
  );
  return {
    frame: applyTemporalNoiseToCanvas(
      params.frame,
      temporalOffset,
      0.008,
      params.getTemporalScratch(
        (params.frameIdx % 2) as 0 | 1,
        params.frame.width,
        params.frame.height
      )
    ),
    temporalOffset,
  };
}
