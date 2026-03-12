import type { QRGeneratorConfig } from '../domain/render/generator';
import { log } from './log';
import { handleOverflowError } from './handle-overflow-error';

export async function handleGenerationError(params: {
  error: unknown;
  effectiveConfig: Record<string, unknown>;
  debouncedConfig: Record<string, unknown>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  const msg = params.error instanceof Error ? params.error.message : '';
  log.debug('Initial generation failed', {
    errorMessage: msg,
    isOverflow: msg.includes('code length overflow'),
  });
  if (!msg.includes('code length overflow')) {
    throw params.error;
  }
  const overflowResult = await handleOverflowError({
    effectiveConfig: params.effectiveConfig,
    debouncedConfigTypeNumber: params.debouncedConfig.typeNumber as number,
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
  });
  if (overflowResult.succeeded) {
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug('QR generated using fallback settings due to content length');
    return { result: overflowResult.result, aborted: false };
  }
  return { result: null, aborted: true };
}
