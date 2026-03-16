/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Run standard QR generation with error handling.
 */

import { createLogger } from "@/infra/logging/logger";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { buildOverflowHandlingParams } from "@/features/generator/application/safety/build-overflow-handling-params";
import { handleGenerationError } from "@/features/generator/application/safety/handle-generation-error.service";
import type { SafetyRunnerParams } from "@/features/generator/application/safety/safety-runner-params";

const log = createLogger("QR");

export async function runStandardGeneration(
  params: SafetyRunnerParams & {
    debouncedConfig: Record<string, unknown>;
    isStaleRequest: () => boolean;
    updateGenerationProgress: (stage: string, percent: number) => void;
  },
): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  try {
    log.debug("Attempting QR generation", {
      contentLength: (params.effectiveConfig.content as string)?.length,
      typeNumber: params.effectiveConfig.typeNumber,
      errorCorrection: params.effectiveConfig.errorCorrection,
    });
    params.updateGenerationProgress(
      params.t("preview.busy.renderingQrPreview", "Rendering your QR preview..."),
      58,
    );
    if (await params.yieldForResponsiveness()) return { result: null, aborted: true };
    const result = await params.runGeneratorWithStatus(
      params.effectiveConfig as unknown as QRGeneratorConfig,
      params.overlayEnabled ? params.overlayCanvas : null,
    );
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug("Initial generation succeeded");
    return { result, aborted: false };
  } catch (error_) {
    return handleGenerationError({
      ...buildOverflowHandlingParams(params),
      debouncedConfig: params.debouncedConfig,
      error: error_,
      isStaleRequest: params.isStaleRequest,
    });
  }
}
