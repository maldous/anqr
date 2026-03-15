import { generateFullQArt, generateFullQArtOptimal } from '../../../domain/qr/qart/generate';
import type {
  QArtWorkerGenerateRequest,
  QArtWorkerMessage,
  QArtWorkerRequest,
  QArtWorkerResultPayload,
} from './worker-protocol';
import { buildWorkerTransferList } from './build-worker-transfer-list';
import { clampPercent } from './clamp-percent';
import { packBooleanMatrix } from './pack-boolean-matrix';
import { tryWorkerSideRender } from './try-worker-side-render';
import type { WorkerContext } from './worker-context.type';
import {
  addCancelledRequestId,
  clearCancelledRequestId,
  isCancelledOrStale,
  updateLatestRequestId,
} from './worker-render-guards';

const PROGRESS_THROTTLE_MS = 80;

const workerContext = globalThis as unknown as WorkerContext;

const handleGenerate = async (message: QArtWorkerGenerateRequest): Promise<void> => {
  const { id, payload } = message;

  updateLatestRequestId(id);
  clearCancelledRequestId(id);

  let lastProgressAt = 0;
  let lastPercent = -1;
  let lastStage = '';

  const postProgress = (stage: string, percent: number): void => {
    if (isCancelledOrStale(id)) return;

    const normalizedPercent = clampPercent(percent);
    const now = performance.now();
    const stageChanged = stage !== lastStage;
    const percentJumped = normalizedPercent - lastPercent >= 2;
    const shouldSend =
      stageChanged ||
      percentJumped ||
      normalizedPercent >= 100 ||
      now - lastProgressAt >= PROGRESS_THROTTLE_MS;

    if (!shouldSend) return;

    lastProgressAt = now;
    lastPercent = normalizedPercent;
    lastStage = stage;

    const progressMessage: QArtWorkerMessage = {
      type: 'progress',
      id,
      stage,
      percent: normalizedPercent,
    };

    workerContext.postMessage(progressMessage);
  };

  try {
    const targetImagePixels = new Uint8ClampedArray(
      payload.targetImagePixels.buffer as ArrayBuffer,
      payload.targetImagePixels.byteOffset,
      payload.targetImagePixels.byteLength
    );
    const targetImage = new ImageData(
      targetImagePixels,
      payload.targetImageWidth,
      payload.targetImageHeight
    );
    const sharedConfig = {
      data: payload.data,
      targetImage,
      version: payload.version,
      ecc: payload.ecc,
      strictSuffix: payload.strictSuffix ?? true,
      targetControlPercent: payload.targetControlPercent ?? 100,
      searchAttempts: payload.searchAttempts ?? 1,
      searchSeed: payload.searchSeed ?? 0,
      lockVersionToMinimum: payload.lockVersionToMinimum ?? false,
      performanceProfile: payload.performanceProfile ?? 'quality',
      onProgress: postProgress,
    };

    const result =
      typeof payload.maskPattern === 'number' && payload.maskPattern >= 0
        ? await generateFullQArt({
            ...sharedConfig,
            maskPattern: payload.maskPattern,
          })
        : await generateFullQArtOptimal(sharedConfig);

    if (isCancelledOrStale(id)) return;

    const response: QArtWorkerResultPayload = {
      success: result.success,
      error: result.error,
      moduleCount: result.moduleCount,
      version: result.version,
      maskPattern: result.maskPattern,
      matchingPixels: result.matchingPixels,
      totalControllable: result.totalControllable,
      matchPercentage: result.matchPercentage,
      encodedData: result.encodedData,
    };

    if (result.success && result.matrix.length > 0) {
      response.matrix = packBooleanMatrix(result.matrix);
      if (payload.renderInWorker && payload.renderConfig) {
        await tryWorkerSideRender(response, payload.renderConfig, result.moduleCount);
      }
    }

    const resultMessage: QArtWorkerMessage = { type: 'result', id, result: response };
    workerContext.postMessage(resultMessage, buildWorkerTransferList(response));
  } catch (err) {
    if (isCancelledOrStale(id)) return;

    const resultMessage: QArtWorkerMessage = {
      type: 'result',
      id,
      result: {
        success: false,
        error: err instanceof Error ? err.message : 'QArt worker error',
        moduleCount: 0,
        version: payload.version || 0,
        maskPattern: typeof payload.maskPattern === 'number' ? payload.maskPattern : 0,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
      },
    };
    workerContext.postMessage(resultMessage);
  } finally {
    clearCancelledRequestId(id);
  }
};

workerContext.onmessage = (event: MessageEvent<QArtWorkerRequest>) => {
  const message = event.data;

  if (!message || typeof message !== 'object') return;

  if (message.type === 'cancel') {
    addCancelledRequestId(message.id);
    return;
  }

  if (message.type === 'generate') {
    void handleGenerate(message);
  }
};
