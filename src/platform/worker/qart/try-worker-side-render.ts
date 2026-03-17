import type { QRGeneratorConfig } from "../../../modules/qr-generator";
import type { QArtWorkerResultPayload } from "./worker-protocol";
import { canRenderInWorker } from "./worker-render-guards";
import { workerRenderer } from "./worker-canvas-factory";

export async function tryWorkerSideRender(
  response: QArtWorkerResultPayload,
  renderConfig: unknown,
  moduleCount: number,
): Promise<void> {
  if (!canRenderInWorker() || !response.matrix) return;
  try {
    const config: QRGeneratorConfig = {
      ...(renderConfig as QRGeneratorConfig),
      typeNumber: response.version,
      overlayMode: undefined,
    };
    const renderedCanvas = await workerRenderer.renderFromPackedMatrix(
      response.matrix,
      moduleCount,
      config,
    );
    if (
      typeof OffscreenCanvas !== "undefined" &&
      renderedCanvas instanceof OffscreenCanvas &&
      typeof renderedCanvas.transferToImageBitmap === "function"
    ) {
      response.bitmap = renderedCanvas.transferToImageBitmap();
    }
  } catch {
    // Ignore worker-side render failures and let main-thread rendering handle it.
  }
}
