import type { QRGeneratorConfig } from "./types";

export interface ScanGateCtx {
  effectiveConfig: QRGeneratorConfig;
  overlayComplexity: number;
  requestedOverlayIntensity: number;
  isPreviewScanGate: boolean;
  isScanGateDisabled: boolean;
  skipScanGateEscalation: boolean;
}
