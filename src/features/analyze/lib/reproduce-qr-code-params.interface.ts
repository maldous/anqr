import type { QRAnalysisResult } from '@/modules/qr-analyzer';
import type { ReproductionQrState } from './reproduction-qr-state.interface';
import type { ReproductionRenderState } from './reproduction-render-state.interface';

export interface ReproduceQRCodeParams {
  result: QRAnalysisResult;
  canvas: HTMLCanvasElement;
  analysisSource: string | null;
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  qrState: ReproductionQrState;
  renderState: ReproductionRenderState;
}
