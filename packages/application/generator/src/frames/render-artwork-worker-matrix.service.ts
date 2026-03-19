/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Render artwork worker matrix result.
 */

import type { QArtWorkerResult } from "../qart/qart-shared-types";
import type { QRGeneratorConfig } from "@/domain/qr/generator";
import { qrGenerator } from "../generation/generation-singleton";

export async function renderArtworkWorkerMatrix(params: {
  workerResult: QArtWorkerResult;
  debouncedConfig: Record<string, unknown>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (!params.workerResult.matrix || params.workerResult.moduleCount <= 0) return null;
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: params.workerResult.version,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  return await qrGenerator.renderFromPackedMatrix(
    params.workerResult.matrix,
    params.workerResult.moduleCount,
    qrArtConfig,
  );
}
