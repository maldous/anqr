/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle generation error with overflow detection.
 */

import { createLogger } from "@/infra/logging/logger";
import { buildOverflowHandlingParams } from "./build-overflow-handling-params";
import { handleOverflowError } from "./handle-overflow-error.service";
import type { SafetyRunnerParams } from "./safety-runner-params";

const log = createLogger("QR");

export async function handleGenerationError(
  params: SafetyRunnerParams & {
    error: unknown;
    debouncedConfig: Record<string, unknown>;
    isStaleRequest: () => boolean;
  },
): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  const msg = params.error instanceof Error ? params.error.message : "";
  log.debug("Initial generation failed", {
    errorMessage: msg,
    isOverflow: msg.includes("code length overflow"),
  });
  if (!msg.includes("code length overflow")) {
    throw params.error;
  }
  const overflowResult = await handleOverflowError({
    ...buildOverflowHandlingParams(params),
    debouncedConfigTypeNumber: params.debouncedConfig.typeNumber as number,
  });
  if (overflowResult.succeeded) {
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug("QR generated using fallback settings due to content length");
    return { result: overflowResult.result, aborted: false };
  }
  return { result: null, aborted: true };
}
