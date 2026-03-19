import type { AnyCanvas, QRGeneratorConfig } from "@/domain/qr/generator";

export interface SafetyRunnerParams {
  clearGenerationProgress: () => void;
  effectiveConfig: Record<string, unknown>;
  isOverflowBlockedRef: { current: boolean };
  lastOverflowContentRef: { current: string | null };
  overlayCanvas: AnyCanvas | null;
  overlayEnabled: boolean;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: AnyCanvas | null,
  ) => Promise<AnyCanvas | null>;
  setError: (v: string | null) => void;
  setHasOverflowError: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsRendering: (v: boolean) => void;

  t: (...args: any[]) => any;
  yieldForResponsiveness: () => Promise<boolean>;
}
