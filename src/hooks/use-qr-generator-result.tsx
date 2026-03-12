import type { ValidationResult } from '../domain/qr/analyze';

export interface UseQRGeneratorResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  isLoading: boolean;
  isExporting: boolean;
  isRendering: boolean; // True when actively rendering (after debounce, during generation)
  isPending: boolean; // True when config has changed but debounce hasn't settled yet
  error: string | null;
  regenerate: () => Promise<void>;
  cancelGeneration: () => void;
  download: () => Promise<void>;
  // Animation state
  isAnimating: boolean;
  currentFrame: number;
  totalFrames: number;
  // True when we have multi-frame content but animation cache isn't ready yet
  isPreparingAnimation: boolean;
  // Safety warnings
  safetyWarnings: string[];
  // Validation
  validation: ValidationResult | null;
  isValidating: boolean;
  // Busy overlay feedback
  busyStage: string | null;
  busyProgress: number | null;
  // True when fast-preview mode is active during live interaction
  isFastPreview: boolean;
  // Animation frames for GIF export
  animationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
  animationFramesRevision: number;
}
