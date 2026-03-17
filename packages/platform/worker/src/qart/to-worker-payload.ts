import type { QArtWorkerGenerateInput, QArtWorkerGeneratePayload } from "./worker-protocol";

export function toWorkerPayload(input: QArtWorkerGenerateInput): QArtWorkerGeneratePayload {
  const pixelsCopy = new Uint8ClampedArray(input.targetImage.data);
  return {
    data: input.data,
    ecc: input.ecc,
    version: input.version,
    maskPattern: input.maskPattern,
    lockVersionToMinimum: input.lockVersionToMinimum,
    strictSuffix: input.strictSuffix,
    targetControlPercent: input.targetControlPercent,
    searchAttempts: input.searchAttempts,
    searchSeed: input.searchSeed,
    performanceProfile: input.performanceProfile,
    renderConfig: input.renderConfig,
    renderInWorker: input.renderInWorker,
    targetImageWidth: input.targetImage.width,
    targetImageHeight: input.targetImage.height,
    targetImagePixels: pixelsCopy,
  };
}
