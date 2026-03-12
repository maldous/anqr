import type { QRGeneratorConfig } from '../domain/render/generator';
import { log } from './log';
import { handleGenerationError } from './handle-generation-error';

export async function runStandardGeneration(params: {
  effectiveConfig: Record<string, unknown>;
  debouncedConfig: Record<string, unknown>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
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
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  try {
    log.debug('Attempting QR generation', {
      contentLength: (params.effectiveConfig.content as string)?.length,
      typeNumber: params.effectiveConfig.typeNumber,
      errorCorrection: params.effectiveConfig.errorCorrection,
    });
    params.updateGenerationProgress(
      params.t('preview.busy.renderingQrPreview', 'Rendering your QR preview...'),
      58
    );
    if (await params.yieldForResponsiveness()) return { result: null, aborted: true };
    const result = await params.runGeneratorWithStatus(
      params.effectiveConfig as unknown as QRGeneratorConfig,
      params.overlayEnabled ? params.overlayCanvas : null
    );
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug('Initial generation succeeded');
    return { result, aborted: false };
  } catch (error_) {
    return handleGenerationError({
      error: error_,
      effectiveConfig: params.effectiveConfig,
      debouncedConfig: params.debouncedConfig,
      overlayEnabled: params.overlayEnabled,
      overlayCanvas: params.overlayCanvas,
      isStaleRequest: params.isStaleRequest,
      yieldForResponsiveness: params.yieldForResponsiveness,
      runGeneratorWithStatus: params.runGeneratorWithStatus,
      lastOverflowContentRef: params.lastOverflowContentRef,
      isOverflowBlockedRef: params.isOverflowBlockedRef,
      setHasOverflowError: params.setHasOverflowError,
      setError: params.setError,
      setIsRendering: params.setIsRendering,
      setIsLoading: params.setIsLoading,
      clearGenerationProgress: params.clearGenerationProgress,
      t: params.t,
    });
  }
}
