import type { CanvasFactory } from "@/domain/render/canvas";
import { renderServerQROutput } from "./render-server-qr-output.service";
import { buildBasicGeneratorConfig } from "./build-basic-generator-config";
import { buildOverlayFilterOptionsFromServerParams } from "./build-overlay-filter-options-from-server-params";
import type { ServerQRRequestParams } from "./server-qr-request-params.types";

export async function renderConfiguredServerQROutput(
  params: ServerQRRequestParams,
  canvasFactory: CanvasFactory,
): Promise<{ outputBuffer: Buffer; contentType: string }> {
  const config = buildBasicGeneratorConfig(params, params.modulePxParam ?? undefined);
  const filterOptions = buildOverlayFilterOptionsFromServerParams(params);
  return renderServerQROutput(params, config, filterOptions, canvasFactory);
}
