import { createLogger } from "@/infra/logging/logger";
import { getCanvas2DContext } from "@/domain/render/canvas";
import { acquireHashCanvas } from "./acquire-hash-canvas";
import { canvasHashCache } from "./canvas-hash-cache";
import { HASH_CANVAS_SIZE } from "./hash-canvas-size";

const log = createLogger("GENERATE");

export async function hashCanvasContent(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
): Promise<string> {
  const cachedHash = canvas instanceof HTMLCanvasElement ? canvasHashCache.get(canvas) : undefined;
  if (cachedHash !== undefined) {
    return cachedHash;
  }

  const { canvas: hashCanvas, release } = await acquireHashCanvas(createCanvasFn);
  try {
    if (hashCanvas.width !== HASH_CANVAS_SIZE || hashCanvas.height !== HASH_CANVAS_SIZE) {
      hashCanvas.width = HASH_CANVAS_SIZE;
      hashCanvas.height = HASH_CANVAS_SIZE;
    }

    const hashCtx = getCanvas2DContext(hashCanvas, {
      willReadFrequently: true,
      desynchronized: true,
    });
    if (!hashCtx) {
      return `${canvas.width}x${canvas.height}`;
    }

    hashCtx.clearRect(0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
    hashCtx.drawImage(canvas as CanvasImageSource, 0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);

    const imageData = hashCtx.getImageData(0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
    const data = imageData.data;

    let hash = 5381;
    for (let i = 0; i < data.length; i += 4) {
      hash = (hash << 5) + hash + data[i];
      hash = (hash << 5) + hash + data[i + 1];
      hash = (hash << 5) + hash + data[i + 2];
      hash = hash >>> 0;
    }

    const hashStr = hash.toString(16);

    if (canvas instanceof HTMLCanvasElement) {
      canvasHashCache.set(canvas, hashStr);
    }

    return hashStr;
  } catch (error) {
    log.warn("Canvas hashing failed", { error });
    return `${canvas.width}x${canvas.height}`;
  } finally {
    release();
  }
}
