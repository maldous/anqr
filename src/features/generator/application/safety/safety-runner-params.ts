import type { QRGeneratorConfig } from "@/modules/qr-generator";

export interface SafetyRunnerParams {
  clearGenerationProgress: () => void;
  effectiveConfig: Record<string, unknown>;
  isOverflowBlockedRef: { current: boolean };
  lastOverflowContentRef: { current: string | null };
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  overlayEnabled: boolean;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null,
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  setError: (v: string | null) => void;
  setHasOverflowError: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsRendering: (v: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  yieldForResponsiveness: () => Promise<boolean>;
}
