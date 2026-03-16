import type { QRAnalysisResult } from "@/modules/qr-analyzer";
import type { ReproductionParams, ReproductionQrState } from "./reproduction-types";
import { resolveMode } from "./resolve-mode";

export function resolveReproductionParams(
  result: QRAnalysisResult,
  analysisSource: string | null,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  qrState: ReproductionQrState,
): ReproductionParams {
  const isGeneratorSource = analysisSource === "generator" && !!generatedCanvas;
  const maskFromResult = result.maskPattern;
  const maskFromState = qrState.maskPattern;
  return {
    ecc: result.eccLevel || "M",
    isGeneratorSource,
    versionToUse: isGeneratorSource ? (result.version ?? qrState.version) : result.version,
    maskToUse:
      typeof maskFromResult === "number" && maskFromResult >= 0 && maskFromResult <= 7
        ? maskFromResult
        : typeof maskFromState === "number" && maskFromState >= 0
          ? maskFromState
          : undefined,
    modeToUse: resolveMode(isGeneratorSource, result, qrState),
  };
}

export { buildEncoderInput } from "./build-encoder-input";
export { resolveEffectiveMode } from "./resolve-effective-mode";
export { resolveFinalVersion } from "./resolve-final-version";
export { createQRWithFallback } from "./create-qr-with-fallback";
