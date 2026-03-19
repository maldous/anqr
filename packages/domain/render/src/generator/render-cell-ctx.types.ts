import type {
  OverlayData,
  QRCodeInstance,
  QRGeneratorConfig,
} from "@/domain/render/qr-generator-shared";
import type { ModuleDrawContext } from "./module-draw-context.types";

export interface RenderCellCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  moduleCount: number;
  moduleSize: number;
  margin: number;
  overlayData: OverlayData | null;
  ditherPattern: boolean[][] | null;
  effectiveIntensity: number;
  functionalMap: Uint8Array;
  moduleDrawCtx: ModuleDrawContext;
  effectiveFgColor: string;
  effectiveBgColor: string;
  needsExplicitLightModules: boolean;
  hasOverlayData: boolean;
  preserveFinders: boolean | undefined;
  preserveTiming: boolean | undefined;
  preserveAlignment: boolean | undefined;
  protectFormat: boolean | undefined;
  protectVersion: boolean | undefined;
  hasPerModuleColor: boolean;
  hasPalette: boolean;
  hasContrastGuard: boolean;
  hasJitter: boolean;
  jitterPx: number;
  frameIndex: number;
  pixelSnap: string;
  gap: number;
  isFastPreview: boolean;
  useGradient: boolean;
  gradientFill: CanvasGradient | null | undefined;
}
