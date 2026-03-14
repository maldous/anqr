import type { OverlayData, QRGeneratorConfig } from '../../../modules/qr-generator/types';
import type { CanvasContext } from './canvas-context.interface';

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
