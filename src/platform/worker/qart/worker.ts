import { generateFullQArt, generateFullQArtOptimal } from '../../../domain/qr/qart/generate';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../../modules/qr-generator';
import type {
  QArtWorkerGenerateRequest,
  QArtWorkerMessage,
  QArtWorkerRequest,
  QArtWorkerResultPayload,
} from './worker-protocol';

const PROGRESS_THROTTLE_MS = 80;

type WorkerContext = {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<QArtWorkerRequest>) => void) | null;
};

const workerContext = globalThis as unknown as WorkerContext;
const workerCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => new OffscreenCanvas(width, height),
};
const workerRenderer = new QRGenerator(workerCanvasFactory);

let latestRequestId = 0;
const cancelledRequestIds = new Set<number>();

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function packBooleanMatrix(matrix: boolean[][]): Uint8Array {
  const moduleCount = matrix.length;
  const packed = new Uint8Array(moduleCount * moduleCount);

  let idx = 0;
  for (let row = 0; row < moduleCount; row++) {
    const rowData = matrix[row];
    for (let col = 0; col < moduleCount; col++) {
      packed[idx++] = rowData?.[col] ? 1 : 0;
    }
  }

  return packed;
}

function canRenderInWorker(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

function isCancelledOrStale(id: number): boolean {
  return cancelledRequestIds.has(id) || latestRequestId !== id;
}

async function tryWorkerSideRender(
  response: QArtWorkerResultPayload,
  renderConfig: unknown,
  moduleCount: number
): Promise<void> {
  if (!canRenderInWorker() || !response.matrix) return;
  try {
    const config: QRGeneratorConfig = {
      ...(renderConfig as unknown as QRGeneratorConfig),
      typeNumber: response.version,
      overlayMode: undefined,
    };
    const renderedCanvas = await workerRenderer.renderFromPackedMatrix(
      response.matrix,
      moduleCount,
      config
    );
    if (
      typeof OffscreenCanvas !== 'undefined' &&
      renderedCanvas instanceof OffscreenCanvas &&
      typeof renderedCanvas.transferToImageBitmap === 'function'
    ) {
      response.bitmap = renderedCanvas.transferToImageBitmap();
    }
  } catch {
    // Ignore worker-side render failures and let main-thread rendering handle it.
  }
}

function buildWorkerTransferList(response: QArtWorkerResultPayload): Transferable[] {
  const transferList: Transferable[] = [];
  if (response.matrix) {
    transferList.push(response.matrix.buffer as ArrayBuffer);
  }
  if (response.bitmap) {
    transferList.push(response.bitmap);
  }
  return transferList;
}

async function handleGenerate(message: QArtWorkerGenerateRequest): Promise<void> {
  const { id, payload } = message;

  latestRequestId = Math.max(latestRequestId, id);
  cancelledRequestIds.delete(id);

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
    cancelledRequestIds.delete(id);
  }
}

workerContext.onmessage = (event: MessageEvent<QArtWorkerRequest>) => {
  const message = event.data;

  if (!message || typeof message !== 'object') return;

  if (message.type === 'cancel') {
    cancelledRequestIds.add(message.id);
    return;
  }

  if (message.type === 'generate') {
    void handleGenerate(message);
  }
};
