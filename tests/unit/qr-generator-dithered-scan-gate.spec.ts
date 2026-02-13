import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { decodeGif } from '../../src/modules/animation/gif-codec';
import { decodeQR } from '../../src/modules/qr-decoder';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';

if (typeof globalThis.ImageData === 'undefined') {
  try {
    const sampleCtx = createCanvas(1, 1).getContext('2d');
    const nativeCtor = sampleCtx
      ? Object.getPrototypeOf(sampleCtx.getImageData(0, 0, 1, 1)).constructor
      : null;
    if (nativeCtor) {
      (globalThis as Record<string, unknown>).ImageData = nativeCtor;
    }
  } catch {
    // Fallback for environments without canvas-native ImageData.
    (globalThis as Record<string, unknown>).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      colorSpace: string;
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = height!;
        }
        this.colorSpace = 'srgb';
      }
    };
  }
}

const nodeCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => createCanvas(width, height) as any,
};

function canvasToImageData(canvas: any): ImageData {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: imageData.data, width: canvas.width, height: canvas.height } as ImageData;
}

function meanChromaDistance(imageData: ImageData): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    sum += (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 3;
    count++;
  }
  return sum / Math.max(1, count);
}

function meanModuleCenterLumaByBit(
  canvas: any,
  matrix: boolean[][],
  marginModules: number
): { darkMean: number; lightMean: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const lumaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    return (
      (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255
    );
  };

  let darkSum = 0;
  let lightSum = 0;
  let darkCount = 0;
  let lightCount = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const cx = offset + (col + 0.5) * pitch;
      const cy = offset + (row + 0.5) * pitch;
      const l = lumaAt(cx, cy);
      if (matrix[row][col]) {
        darkSum += l;
        darkCount++;
      } else {
        lightSum += l;
        lightCount++;
      }
    }
  }
  return {
    darkMean: darkSum / Math.max(1, darkCount),
    lightMean: lightSum / Math.max(1, lightCount),
  };
}

async function loadOverlayCanvas(filePath: string, size: number): Promise<any> {
  const img = await loadImage(filePath);
  const overlay = createCanvas(size, size);
  const ctx = overlay.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img as any, 0, 0, size, size);
  return overlay as any;
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function loadGifOverlayFrames(filePath: string, size: number, maxFrames: number): any[] {
  const gif = decodeGif(toArrayBuffer(fs.readFileSync(filePath)));
  const composite = createCanvas(gif.width, gif.height);
  const compositeCtx = composite.getContext('2d');
  const overlays: any[] = [];
  const frameCount = Math.min(maxFrames, gif.frames.length);

  for (let i = 0; i < frameCount; i++) {
    const frame = gif.frames[i] as {
      dims: { left: number; top: number; width: number; height: number };
      patch: Uint8Array;
      disposalType: number;
    };
    const { left, top, width, height } = frame.dims;
    const restore = frame.disposalType === 3 ? compositeCtx.getImageData(left, top, width, height) : null;

    const patchCanvas = createCanvas(width, height);
    const patchCtx = patchCanvas.getContext('2d');
    patchCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), width, height), 0, 0);
    compositeCtx.drawImage(patchCanvas as any, left, top);

    const output = createCanvas(gif.width, gif.height);
    const outputCtx = output.getContext('2d');
    outputCtx.drawImage(composite as any, 0, 0);

    const overlay = createCanvas(size, size);
    const overlayCtx = overlay.getContext('2d');
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.imageSmoothingQuality = 'high';
    overlayCtx.drawImage(output as any, 0, 0, size, size);
    overlays.push(overlay as any);

    if (frame.disposalType === 2) {
      compositeCtx.clearRect(left, top, width, height);
    } else if (frame.disposalType === 3 && restore) {
      compositeCtx.putImageData(restore, left, top);
    }
  }

  return overlays;
}

async function expectScanGatePass(
  qr: QRGenerator,
  cfg: QRGeneratorConfig,
  overlayPath: string,
  artifactFileName: string,
  options?: { minChromaDistance?: number }
): Promise<void> {
  const overlay = await loadOverlayCanvas(path.join(process.cwd(), overlayPath), 200);
  const generated = await qr.generate(cfg, overlay);
  const pngBuffer = (generated as any).toBuffer('image/png');
  if (process.env.SAVE_QR_ARTIFACT === '1') {
    fs.writeFileSync(path.join(process.cwd(), artifactFileName), pngBuffer);
  }

  const generatedImageData = canvasToImageData(generated as any);
  const decodedCanvas = decodeQR(generatedImageData, {
    inversionAttempts: 'attemptBoth',
  });
  expect(decodedCanvas?.data).toBe(cfg.content);
  const minChromaDistance = options?.minChromaDistance ?? 3;
  expect(meanChromaDistance(generatedImageData)).toBeGreaterThanOrEqual(minChromaDistance);
  const roundtripImage = await loadImage(pngBuffer);
  const roundtripCanvas = createCanvas((generated as any).width, (generated as any).height);
  const roundtripCtx = roundtripCanvas.getContext('2d');
  roundtripCtx.drawImage(roundtripImage as any, 0, 0, roundtripCanvas.width, roundtripCanvas.height);

  const decodedRoundtrip = decodeQR(canvasToImageData(roundtripCanvas as any), {
    inversionAttempts: 'attemptBoth',
  });
  expect(decodedRoundtrip?.data).toBe(cfg.content);
}

describe('qr-generator dithered scan gate', () => {
  it(
    'keeps dithered tsunami output decodable from final PNG bytes',
    async () => {
      const qr = new QRGenerator(nodeCanvasFactory);
      const payload = 'https://anqr.link';
      const cfg: QRGeneratorConfig = {
        content: payload,
        errorCorrection: 'H',
        typeNumber: 0,
        moduleSize: 20,
        margin: 4,
        fgColor: '#000000',
        bgColor: '#ffffff',
        overlayMode: 'dithered',
        overlayIntensity: 100,
        colorMode: 'color',
        ditherStrength: 50,
        ditherSerpentine: false,
        renderScalePerModule: 18,
        seed: 42,
      };
      await expectScanGatePass(qr, cfg, 'public/tsunami.jpg', 'tsunami-generated-current.png');
    },
    15000
  );

  it('keeps dithered king gif first-frame output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      content: payload,
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 100,
      colorMode: 'color',
      ditherStrength: 50,
      ditherSerpentine: false,
      renderScalePerModule: 18,
      seed: 42,
      preserveFinders: true,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    };
    await expectScanGatePass(qr, cfg, 'public/king.gif', 'king-generated-current.png');
  });

  it('keeps dithered king gif first-frame decodable in preview scan-gate profile', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      content: payload,
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 100,
      colorMode: 'color',
      ditherStrength: 50,
      ditherSerpentine: false,
      renderScalePerModule: 18,
      seed: 42,
      scanGateProfile: 'preview',
      preserveFinders: true,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    };
    await expectScanGatePass(qr, cfg, 'public/king.gif', 'king-generated-preview-current.png');
  });

  it(
    'keeps sampled animated king gif frames decodable in preview scan-gate profile',
    async () => {
      const qr = new QRGenerator(nodeCanvasFactory);
      const payload = 'https://anqr.link';
      const cfg: QRGeneratorConfig = {
        content: payload,
        errorCorrection: 'H',
        typeNumber: 0,
        moduleSize: 20,
        margin: 4,
        fgColor: '#000000',
        bgColor: '#ffffff',
        overlayMode: 'dithered',
        overlayIntensity: 100,
        colorMode: 'color',
        ditherStrength: 50,
        ditherSerpentine: false,
        renderScalePerModule: 18,
        seed: 42,
        scanGateProfile: 'preview',
        preserveFinders: true,
        preserveTiming: false,
        preserveAlignment: false,
        protectFormatInfo: false,
        protectVersionInfo: false,
      };
      const overlays = loadGifOverlayFrames(path.join(process.cwd(), 'public/king.gif'), 200, 8);
      let decodedCount = 0;
      for (let i = 0; i < overlays.length; i++) {
        const generated = await qr.generate({ ...cfg, frameIndex: i }, overlays[i]);
        const decoded = decodeQR(canvasToImageData(generated as any), {
          inversionAttempts: 'attemptBoth',
        });
        if (decoded?.data === cfg.content) decodedCount++;
      }
      expect(decodedCount).toBe(overlays.length);
    },
    30000
  );

  it('keeps dithered bw mode decodable (regression: no null color crash)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      content: payload,
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 90,
      colorMode: 'bw',
      ditherStrength: 50,
      ditherSerpentine: false,
      renderScalePerModule: 18,
      seed: 42,
    };
    await expectScanGatePass(qr, cfg, 'public/tsunami.jpg', 'tsunami-generated-bw-current.png', {
      minChromaDistance: 0,
    });
  });

  it('keeps grayscale output polarity correct (dark modules stay darker than light)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      content: payload,
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 90,
      colorMode: 'grayscale',
      ditherStrength: 50,
      ditherSerpentine: false,
      renderScalePerModule: 18,
      seed: 42,
    };

    const overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/tsunami.jpg'), 200);
    const generated = await qr.generate(cfg, overlay);
    const generatedImageData = canvasToImageData(generated as any);
    const decoded = decodeQR(generatedImageData, { inversionAttempts: 'attemptBoth' });
    expect(decoded?.data).toBe(cfg.content);

    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();
    const polarity = meanModuleCenterLumaByBit(generated as any, matrixData!.matrix, cfg.margin);
    expect(polarity.darkMean).toBeLessThan(polarity.lightMean - 0.08);
  });

  it('caches dither scan patches across repeated renders', async () => {
    const qr = new QRGenerator(nodeCanvasFactory) as any;
    const cfg: QRGeneratorConfig = {
      content: 'https://anqr.link',
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 100,
      colorMode: 'color',
      ditherStrength: 50,
      ditherSerpentine: false,
      renderScalePerModule: 18,
      seed: 42,
      scanGateProfile: 'preview',
      preserveFinders: true,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
    };
    const overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/king.gif'), 200);
    await qr.generate(cfg, overlay);
    expect((qr._ditherPatchCache?.size ?? 0) > 0).toBe(true);
    await qr.generate(cfg, overlay);
    expect((qr._ditherPatchCache?.size ?? 0) > 0).toBe(true);
  });
});
