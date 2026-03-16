import type { SafetyRunnerParams } from "./safety-runner-params";

export function buildOverflowHandlingParams(params: SafetyRunnerParams) {
  return {
    effectiveConfig: params.effectiveConfig,
    runGeneratorWithStatus: params.runGeneratorWithStatus,
    yieldForResponsiveness: params.yieldForResponsiveness,
    overlayEnabled: params.overlayEnabled,
    overlayCanvas: params.overlayCanvas,
    lastOverflowContentRef: params.lastOverflowContentRef,
    isOverflowBlockedRef: params.isOverflowBlockedRef,
    setHasOverflowError: params.setHasOverflowError,
    setError: params.setError,
    setIsRendering: params.setIsRendering,
    setIsLoading: params.setIsLoading,
    clearGenerationProgress: params.clearGenerationProgress,
    t: params.t,
  };
}
