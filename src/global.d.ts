// Global state for QR generator
declare global {
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

  var adsbygoogle: Array<Record<string, unknown>> | undefined;
}
export {};
