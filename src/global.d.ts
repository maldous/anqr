// Global state for QR generator
declare global {
  // eslint-disable-next-line no-var
  var __ANQR_STATE__:
    | {
        canvas?: HTMLCanvasElement | OffscreenCanvas;
        ready?: boolean;
        isLoading?: boolean;
        isAnimationReady?: boolean;
        animationFrameCount?: number;
        currentFrame?: number;
        animationFrames?: Array<HTMLCanvasElement | OffscreenCanvas>;
        animationSpeedMs?: number;
        frameDelays?: number[];
      }
    | undefined;
  // eslint-disable-next-line no-var
  var adsbygoogle: Array<Record<string, unknown>> | undefined;
}
export {};
