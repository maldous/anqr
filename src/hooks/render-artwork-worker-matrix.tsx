import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';
import type { QArtWorkerResult } from './q-art-worker-result';

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
    qrArtConfig
  );
}
