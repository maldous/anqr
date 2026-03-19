import type { CanvasFactory } from "@/domain/render/canvas";
import { buildBasicServerQRRequestParams } from "./build-basic-server-qr-request-params";
import { renderConfiguredServerQROutput } from "./render-configured-server-qr-output.service";
import type { BasicServerQRRequest } from "./basic-server-qr-request.types";

export async function renderBasicServerQROutput(
  input: BasicServerQRRequest,
  canvasFactory: CanvasFactory,
): Promise<{ outputBuffer: Buffer; contentType: string }> {
  const params = buildBasicServerQRRequestParams(input);
  return renderConfiguredServerQROutput(params, canvasFactory);
}
