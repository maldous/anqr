import type { ValidationResult } from "@/modules/qr-analyzer";

export interface UseQRGeneratorResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  isLoading: boolean;
  isExporting: boolean;
  isRendering: boolean;
  isPending: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
  cancelGeneration: () => void;
  download: () => Promise<void>;
  isAnimating: boolean;
  currentFrame: number;
  totalFrames: number;
  isPreparingAnimation: boolean;
  safetyWarnings: string[];
  validation: ValidationResult | null;
  isValidating: boolean;
  busyStage: string | null;
  busyProgress: number | null;
  isFastPreview: boolean;
  animationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
  animationFramesRevision: number;
}
