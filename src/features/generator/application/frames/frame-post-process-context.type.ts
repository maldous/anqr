import type { PatternEffect } from './frames-type-patterneffect';

export interface FramePostProcessContext<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
> {
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getLatestFrame: () => HTMLCanvasElement | OffscreenCanvas | undefined;
  hasColorCycle: boolean;
  isRunCancelled: () => boolean;
  persistFrameCanvas: (c: HTMLCanvasElement | OffscreenCanvas) => void;
  resultPatternEffects: PatternEffect[];
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
}
