import type { OverlayData, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import type { CanvasContext } from "./canvas-context.types";

export interface ModuleDrawContext {
  ctx: CanvasContext;
  config: QRGeneratorConfig;
  isFastPreview: boolean;
  cornerRadius: number;
  dotRotation: number;
  timingStyle: string;
  isStrokeGapMode: boolean;
  strokeWidth: number;
  overlayModeIsHalftoneDithered: boolean;
  overlayData: OverlayData | null;
  setFillStyle: (fill: string | CanvasGradient) => void;
}
