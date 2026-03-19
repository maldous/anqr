import type { QRAnalysisResult } from "@/contracts/analyze";
import type { ReproductionQrState } from "./reproduction-qr.types";
import type { ReproductionRenderState } from "./reproduction-render.types";

export interface ReproduceQRCodeParams {
  result: QRAnalysisResult;
  canvas: HTMLCanvasElement;
  analysisSource: string | null;
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  qrState: ReproductionQrState;
  renderState: ReproductionRenderState;
}
