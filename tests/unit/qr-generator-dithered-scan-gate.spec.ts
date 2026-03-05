import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { beforeAll, describe, expect, it } from 'vitest';
import { decodeGif } from '../../src/modules/animation/gif-codec';
import { decodeQR } from '../../src/modules/qr-decoder';
import {
  type CanvasFactory,
  QRGenerator,
  type QRGeneratorConfig,
} from '../../src/modules/qr-generator';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../../src/modules/qr-spec/qr-patterns';

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

function meanRgbDelta(a: ImageData, b: ImageData): number {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`Image sizes differ: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  let sum = 0;
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    sum +=
      Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2]);
    count++;
  }
  return sum / Math.max(1, count * 3);
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
    return (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255;
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

function meanModuleCenterLumaByBitMasked(
  canvas: any,
  matrix: boolean[][],
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean
): { darkMean: number; lightMean: number; darkCount: number; lightCount: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const lumaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    return (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255;
  };

  let darkSum = 0;
  let lightSum = 0;
  let darkCount = 0;
  let lightCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!include(row, col, moduleCount, version)) continue;
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
    darkCount,
    lightCount,
  };
}

function moduleCenterBinaryAgreementByMask(
  canvas: any,
  matrix: boolean[][],
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean
): { agreement: number; moduleCount: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const lumaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    return (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255;
  };

  let matches = 0;
  let count = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!include(row, col, moduleCount, version)) continue;
      const cx = offset + (col + 0.5) * pitch;
      const cy = offset + (row + 0.5) * pitch;
      const observedDark = lumaAt(cx, cy) < 0.5;
      if (observedDark === matrix[row][col]) {
        matches++;
      }
      count++;
    }
  }

  return {
    agreement: matches / Math.max(1, count),
    moduleCount: count,
  };
}

function darkModuleInteriorLumaRangeByMask(
  canvas: any,
  matrix: boolean[][],
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean
): { maxLuma: number; sampleCount: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const lumaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    return (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255;
  };

  let maxLuma = 0;
  let sampleCount = 0;
  const fractions = [0.25, 0.5, 0.75];
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix[row][col]) continue;
      if (!include(row, col, moduleCount, version)) continue;
      for (const fy of fractions) {
        for (const fx of fractions) {
          const x = offset + (col + fx) * pitch;
          const y = offset + (row + fy) * pitch;
          maxLuma = Math.max(maxLuma, lumaAt(x, y));
          sampleCount++;
        }
      }
    }
  }

  return { maxLuma, sampleCount };
}

function darkModuleInkCoverageByMask(
  canvas: any,
  matrix: boolean[][],
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean,
  lumaThreshold: number = 0.55
): { inkCoverage: number; sampleCount: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const lumaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    return (0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2]) / 255;
  };

  const fractions = [0.17, 0.33, 0.5, 0.67, 0.83];
  let inkCount = 0;
  let sampleCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix[row][col]) continue;
      if (!include(row, col, moduleCount, version)) continue;
      for (const fy of fractions) {
        for (const fx of fractions) {
          const x = offset + (col + fx) * pitch;
          const y = offset + (row + fy) * pitch;
          if (lumaAt(x, y) <= lumaThreshold) {
            inkCount++;
          }
          sampleCount++;
        }
      }
    }
  }

  return {
    inkCoverage: inkCount / Math.max(1, sampleCount),
    sampleCount,
  };
}

function meanModuleCenterChromaByMask(
  canvas: any,
  matrix: boolean[][],
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean
): { meanChroma: number; sampleCount: number } {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const moduleCount = matrix.length;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvas.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const chromaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvas.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvas.height - 1, Math.round(y)));
    const idx = (yy * canvas.width + xx) * 4;
    const r = imageData[idx];
    const g = imageData[idx + 1];
    const b = imageData[idx + 2];
    return (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 3;
  };

  let sum = 0;
  let sampleCount = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!include(row, col, moduleCount, version)) continue;
      const cx = offset + (col + 0.5) * pitch;
      const cy = offset + (row + 0.5) * pitch;
      sum += chromaAt(cx, cy);
      sampleCount++;
    }
  }
  return {
    meanChroma: sum / Math.max(1, sampleCount),
    sampleCount,
  };
}

function meanModuleCenterRgbDeltaByMask(
  canvasA: any,
  canvasB: any,
  moduleCount: number,
  marginModules: number,
  mask: (row: number, col: number, moduleCount: number, version: number) => boolean
): { inside: number; outside: number; insideCount: number; outsideCount: number } {
  const ctxA = canvasA.getContext('2d');
  const ctxB = canvasB.getContext('2d');
  const dataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height).data;
  const dataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height).data;
  const pitch = canvasA.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;
  const version = Math.ceil((moduleCount - 17) / 4);

  const pixelDelta = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvasA.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvasA.height - 1, Math.round(y)));
    const idx = (yy * canvasA.width + xx) * 4;
    const dr = Math.abs(dataA[idx] - dataB[idx]);
    const dg = Math.abs(dataA[idx + 1] - dataB[idx + 1]);
    const db = Math.abs(dataA[idx + 2] - dataB[idx + 2]);
    return (dr + dg + db) / 3;
  };

  let insideSum = 0;
  let outsideSum = 0;
  let insideCount = 0;
  let outsideCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const cx = offset + (col + 0.5) * pitch;
      const cy = offset + (row + 0.5) * pitch;
      const delta = pixelDelta(cx, cy);
      if (mask(row, col, moduleCount, version)) {
        insideSum += delta;
        insideCount++;
      } else {
        outsideSum += delta;
        outsideCount++;
      }
    }
  }

  return {
    inside: insideSum / Math.max(1, insideCount),
    outside: outsideSum / Math.max(1, outsideCount),
    insideCount,
    outsideCount,
  };
}

function isFinderModuleOrSeparator(row: number, col: number, moduleCount: number): boolean {
  const isFinderSeparator =
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8);
  return isFinderPattern(row, col, moduleCount) || isFinderSeparator;
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
    const restore =
      frame.disposalType === 3 ? compositeCtx.getImageData(left, top, width, height) : null;

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
  roundtripCtx.drawImage(
    roundtripImage as any,
    0,
    0,
    roundtripCanvas.width,
    roundtripCanvas.height
  );

  const decodedRoundtrip = decodeQR(canvasToImageData(roundtripCanvas as any), {
    inversionAttempts: 'attemptBoth',
  });
  expect(decodedRoundtrip?.data).toBe(cfg.content);
}

function makeDefaultGalleryScanConfig(payload: string): QRGeneratorConfig {
  return {
    content: payload,
    errorCorrection: 'H',
    typeNumber: 0,
    moduleSize: 20,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    overlayMode: 'dithered',
    overlayIntensity: 90,
    colorMode: 'color',
    ditherStrength: 50,
    ditherSerpentine: false,
    renderScalePerModule: 18,
    seed: 42,
    preserveFinders: true,
    preserveTiming: true,
    preserveAlignment: true,
    protectFormatInfo: true,
    protectVersionInfo: true,
  };
}

describe('qr-generator dithered scan gate', { timeout: 30000 }, () => {
  it('keeps dithered tsunami output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg = makeDefaultGalleryScanConfig(payload);
    await expectScanGatePass(qr, cfg, 'public/tsunami.jpg', 'tsunami-generated-current.png');
  }, 15000);

  it('keeps dithered king gif first-frame output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg = makeDefaultGalleryScanConfig(payload);
    await expectScanGatePass(qr, cfg, 'public/king.gif', 'king-generated-current.png');
  }, 15000);

  it('keeps dithered logo output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg = makeDefaultGalleryScanConfig(payload);
    await expectScanGatePass(qr, cfg, 'public/logo.png', 'logo-generated-current.png');
  });

  it('keeps dithered santa output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg = makeDefaultGalleryScanConfig(payload);
    await expectScanGatePass(qr, cfg, 'public/santa.png', 'santa-generated-current.png', {
      minChromaDistance: 0,
    });
  }, 60000);

  it('keeps dithered test output decodable from final PNG bytes', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg = makeDefaultGalleryScanConfig(payload);
    await expectScanGatePass(qr, cfg, 'public/test.png', 'test-generated-current.png', {
      minChromaDistance: 0,
    });
  });

  it('keeps preserveFinders=false dithered output decodable in full scan-gate profile', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      ...makeDefaultGalleryScanConfig(payload),
      preserveFinders: false,
      scanGateProfile: 'full',
    };
    await expectScanGatePass(
      qr,
      cfg,
      'public/tsunami.jpg',
      'tsunami-generated-preserve-finders-off-current.png'
    );
  });

  it('keeps preserveAlignment=false dithered output decodable in full scan-gate profile', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const payload = 'https://anqr.link';
    const cfg: QRGeneratorConfig = {
      ...makeDefaultGalleryScanConfig(payload),
      preserveAlignment: false,
      scanGateProfile: 'full',
    };
    await expectScanGatePass(
      qr,
      cfg,
      'public/tsunami.jpg',
      'tsunami-generated-preserve-alignment-off-current.png'
    );
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
  }, 15000);

  it('keeps dithered dance gif first-frame decodable in preview scan-gate profile', async () => {
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
    await expectScanGatePass(qr, cfg, 'public/dance.gif', 'dance-generated-preview-current.png', {
      minChromaDistance: 0,
    });
  }, 15000);

  it('keeps sampled animated king gif frames decodable in preview scan-gate profile', async () => {
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
  }, 60000);

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

  it('caches dither scan patches across repeated renders', { timeout: 30000 }, async () => {
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

  it('changing dither kind changes rendered output (regression)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/tsunami.jpg'), 200);
    const payload = 'https://anqr.link';
    const base = makeDefaultGalleryScanConfig(payload);

    const renderA = await qr.generate(
      {
        ...base,
        ditherKind: 'error_diffusion',
        seed: 42,
      },
      overlay
    );
    const renderB = await qr.generate(
      {
        ...base,
        ditherKind: 'white_noise',
        seed: 42,
      },
      overlay
    );

    const imgA = canvasToImageData(renderA as any);
    const imgB = canvasToImageData(renderB as any);
    const delta = meanRgbDelta(imgA, imgB);
    expect(delta).toBeGreaterThan(0.2);
  });
});

describe('dither option wiring', { timeout: 30000 }, () => {
  let overlay: any;
  beforeAll(async () => {
    overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/tsunami.jpg'), 200);
  });

  const makeWiringConfig = (): QRGeneratorConfig => ({
    content: 'https://anqr.link',
    errorCorrection: 'H',
    typeNumber: 0,
    moduleSize: 16,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    overlayMode: 'dithered',
    overlayIntensity: 90,
    colorMode: 'color',
    ditherKind: 'error_diffusion',
    ditherStrength: 50,
    finderDitherStrength: 100,
    blendPreservations: false,
    ditherSerpentine: false,
    diffusionKernel: 'floyd_steinberg',
    orderedMatrix: 'bayer4',
    blueNoiseTileSize: 64,
    blueNoiseSeed: 42,
    colorDither: 'none',
    renderScalePerModule: 12,
    scanGateProfile: 'off',
    preserveFinders: true,
    preserveTiming: true,
    preserveAlignment: true,
    protectFormatInfo: true,
    protectVersionInfo: true,
    qrFirstMode: false,
  });

  async function renderDelta(cfgA: QRGeneratorConfig, cfgB: QRGeneratorConfig): Promise<number> {
    const qr = new QRGenerator(nodeCanvasFactory);
    const renderA = await qr.generate(cfgA, overlay);
    const renderB = await qr.generate(cfgB, overlay);
    return meanRgbDelta(canvasToImageData(renderA as any), canvasToImageData(renderB as any));
  }

  it('dither strength changes output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherStrength: 20 },
      { ...base, ditherStrength: 90 }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('finder dither strength changes output when pattern preservation is disabled', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      {
        ...base,
        preserveFinders: false,
        preserveAlignment: false,
        finderDitherStrength: 20,
      },
      {
        ...base,
        preserveFinders: false,
        preserveAlignment: false,
        finderDitherStrength: 100,
      }
    );
    expect(delta).toBeGreaterThan(0.05);
  });

  it('finder dither strength 100 enforces canonical black/white modules in unpreserved finder/alignment areas', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: false,
      preserveAlignment: false,
      finderDitherStrength: 100,
    };
    const render = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const agreement = moduleCenterBinaryAgreementByMask(
      render as any,
      matrixData!.matrix,
      cfg.margin,
      (row, col, moduleCount, version) =>
        isFinderModuleOrSeparator(row, col, moduleCount) ||
        isAlignmentPattern(row, col, moduleCount, version)
    );
    expect(agreement.moduleCount).toBeGreaterThan(0);
    expect(agreement.agreement).toBeGreaterThan(0.95);
  }, 30000);

  it('finder dark modules are rendered as solid black at 100 strength', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: false,
      preserveAlignment: false,
      finderDitherStrength: 100,
    };
    const render = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const lumaRange = darkModuleInteriorLumaRangeByMask(
      render as any,
      matrixData!.matrix,
      cfg.margin,
      (row, col, moduleCount) => isFinderModuleOrSeparator(row, col, moduleCount)
    );
    expect(lumaRange.sampleCount).toBeGreaterThan(0);
    expect(lumaRange.maxLuma).toBeLessThan(0.08);
  }, 30000);

  it('preservation strength 100 renders dark timing/alignment/format modules as solid black when unprotected', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: true,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
      finderDitherStrength: 100,
    };
    const render = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const lumaRange = darkModuleInteriorLumaRangeByMask(
      render as any,
      matrixData!.matrix,
      cfg.margin,
      (row, col, moduleCount, version) =>
        isTimingPattern(row, col, moduleCount) ||
        isAlignmentPattern(row, col, moduleCount, version) ||
        isFormatInfo(row, col, moduleCount) ||
        isVersionInfo(row, col, moduleCount, version)
    );
    expect(lumaRange.sampleCount).toBeGreaterThan(0);
    expect(lumaRange.maxLuma).toBeLessThan(0.08);
  }, 30000);

  it('blend preservations uses image-aware coloring instead of grayscale preservation overlays', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const baseCfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
      finderDitherStrength: 70,
    };
    const flatRender = await qr.generate({ ...baseCfg, blendPreservations: false }, overlay);
    const blendedRender = await qr.generate({ ...baseCfg, blendPreservations: true }, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const mask = (row: number, col: number, moduleCount: number, version: number) =>
      isFinderModuleOrSeparator(row, col, moduleCount) ||
      isTimingPattern(row, col, moduleCount) ||
      isAlignmentPattern(row, col, moduleCount, version) ||
      isFormatInfo(row, col, moduleCount) ||
      isVersionInfo(row, col, moduleCount, version);

    const flatChroma = meanModuleCenterChromaByMask(
      flatRender as any,
      matrixData!.matrix,
      baseCfg.margin,
      mask
    );
    const blendedChroma = meanModuleCenterChromaByMask(
      blendedRender as any,
      matrixData!.matrix,
      baseCfg.margin,
      mask
    );

    expect(flatChroma.sampleCount).toBeGreaterThan(0);
    expect(blendedChroma.sampleCount).toBe(flatChroma.sampleCount);
    expect(blendedChroma.meanChroma).toBeGreaterThan(flatChroma.meanChroma + 1.0);
  }, 30000);

  it('blend preservations keeps preservation regions textured instead of solid fills', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
      finderDitherStrength: 100,
      blendPreservations: true,
    };
    const render = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const textureRange = darkModuleInteriorLumaRangeByMask(
      render as any,
      matrixData!.matrix,
      cfg.margin,
      (row, col, moduleCount, version) =>
        (isFinderModuleOrSeparator(row, col, moduleCount) ||
          isTimingPattern(row, col, moduleCount) ||
          isAlignmentPattern(row, col, moduleCount, version) ||
          isFormatInfo(row, col, moduleCount) ||
          isVersionInfo(row, col, moduleCount, version)) &&
        matrixData!.matrix[row][col]
    );
    expect(textureRange.sampleCount).toBeGreaterThan(0);
    // Solid-black fallback keeps this near zero; textured preservations should keep variation.
    expect(textureRange.maxLuma).toBeGreaterThan(0.12);
  }, 30000);

  it('blend preservations avoids module-fill overlays in boosted functional regions', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const baseCfg: QRGeneratorConfig = {
      ...makeWiringConfig(),
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
      finderDitherStrength: 100,
      blendPreservationMode: 'dither',
    };
    const flatRender = await qr.generate({ ...baseCfg, blendPreservations: false }, overlay);
    const blendedRender = await qr.generate({ ...baseCfg, blendPreservations: true }, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const mask = (row: number, col: number, moduleCount: number, version: number) =>
      isFinderModuleOrSeparator(row, col, moduleCount) ||
      isTimingPattern(row, col, moduleCount) ||
      isAlignmentPattern(row, col, moduleCount, version) ||
      isFormatInfo(row, col, moduleCount) ||
      isVersionInfo(row, col, moduleCount, version);

    const flatCoverage = darkModuleInkCoverageByMask(
      flatRender as any,
      matrixData!.matrix,
      baseCfg.margin,
      mask
    );
    const blendedCoverage = darkModuleInkCoverageByMask(
      blendedRender as any,
      matrixData!.matrix,
      baseCfg.margin,
      mask
    );

    expect(flatCoverage.sampleCount).toBeGreaterThan(0);
    expect(blendedCoverage.sampleCount).toBe(flatCoverage.sampleCount);
    expect(flatCoverage.inkCoverage - blendedCoverage.inkCoverage).toBeGreaterThan(0.05);
    expect(blendedCoverage.inkCoverage).toBeLessThan(0.95);
  }, 30000);

  it('diffusion kernel changes output in error diffusion mode', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherKind: 'error_diffusion', diffusionKernel: 'floyd_steinberg' },
      { ...base, ditherKind: 'error_diffusion', diffusionKernel: 'atkinson' }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('noise-family dither kinds produce distinct output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherKind: 'white_noise' },
      { ...base, ditherKind: 'gaussian_noise' }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('ordered matrix affects true_dither output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherKind: 'true_dither', orderedMatrix: 'bayer2' },
      { ...base, ditherKind: 'true_dither', orderedMatrix: 'bayer8' }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('blue-noise seed affects blue_noise_threshold output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherKind: 'blue_noise_threshold', blueNoiseSeed: 11 },
      { ...base, ditherKind: 'blue_noise_threshold', blueNoiseSeed: 97 }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('color dither mode affects threshold-based dithering output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, ditherKind: 'white_noise', colorDither: 'none' },
      { ...base, ditherKind: 'white_noise', colorDither: 'per_channel' }
    );
    expect(delta).toBeGreaterThan(0.2);
  });

  it('qr-first toggle changes output', async () => {
    const base = makeWiringConfig();
    const delta = await renderDelta(
      { ...base, qrFirstMode: false },
      { ...base, qrFirstMode: true }
    );
    expect(delta).toBeGreaterThan(0.2);
  });
});

describe('preservation toggle locality', { timeout: 30000 }, () => {
  let overlay: any;
  beforeAll(async () => {
    overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/tsunami.jpg'), 200);
  });

  const makePreserveConfig = (): QRGeneratorConfig => ({
    content: 'https://anqr.link',
    errorCorrection: 'H',
    typeNumber: 8,
    moduleSize: 12,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    overlayMode: 'dithered',
    overlayIntensity: 90,
    colorMode: 'color',
    ditherKind: 'error_diffusion',
    ditherStrength: 50,
    ditherSerpentine: false,
    diffusionKernel: 'floyd_steinberg',
    renderScalePerModule: 14,
    seed: 42,
    preserveFinders: true,
    preserveTiming: true,
    preserveAlignment: true,
    protectFormatInfo: true,
    protectVersionInfo: true,
    scanGateProfile: 'off',
  });

  async function renderCanvas(
    cfg: QRGeneratorConfig
  ): Promise<{ canvas: any; moduleCount: number }> {
    const qr = new QRGenerator(nodeCanvasFactory);
    const canvas = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();
    return { canvas, moduleCount: matrixData!.matrix.length };
  }

  async function expectToggleLocality(
    patch: Partial<QRGeneratorConfig>,
    mask: (row: number, col: number, moduleCount: number, version: number) => boolean,
    label: string
  ): Promise<void> {
    const base = makePreserveConfig();
    const baseRender = await renderCanvas(base);
    const toggledRender = await renderCanvas({ ...base, ...patch });
    const locality = meanModuleCenterRgbDeltaByMask(
      baseRender.canvas,
      toggledRender.canvas,
      baseRender.moduleCount,
      base.margin,
      mask
    );
    expect(locality.insideCount, `${label} mask should include modules`).toBeGreaterThan(0);
    expect(
      locality.inside,
      `${label}: region delta should be stronger than outside region`
    ).toBeGreaterThan(locality.outside * 1.6);
    expect(locality.outside, `${label}: outside-region drift should stay limited`).toBeLessThan(16);
  }

  it('preserveFinders toggle is localized to finder regions', async () => {
    await expectToggleLocality(
      { preserveFinders: false },
      (row, col, moduleCount) => {
        const isFinderSeparator =
          (row === 7 && col <= 7) ||
          (col === 7 && row <= 7) ||
          (row === 7 && col >= moduleCount - 8) ||
          (col === moduleCount - 8 && row <= 7) ||
          (row === moduleCount - 8 && col <= 7) ||
          (col === 7 && row >= moduleCount - 8);
        return isFinderPattern(row, col, moduleCount) || isFinderSeparator;
      },
      'preserveFinders'
    );
  }, 30000);

  it('preserveFinders=false bypasses strict scan-gate escalation (full ~= off)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfgBase: QRGeneratorConfig = {
      content: 'https://anqr.link',
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 90,
      colorMode: 'color',
      ditherKind: 'error_diffusion',
      ditherStrength: 50,
      ditherSerpentine: false,
      diffusionKernel: 'floyd_steinberg',
      renderScalePerModule: 18,
      seed: 42,
      preserveFinders: false,
      preserveTiming: true,
      preserveAlignment: true,
      protectFormatInfo: true,
      protectVersionInfo: true,
    };

    const fullCanvas = await qr.generate({ ...cfgBase, scanGateProfile: 'full' }, overlay);
    const offCanvas = await qr.generate({ ...cfgBase, scanGateProfile: 'off' }, overlay);
    const delta = meanRgbDelta(
      canvasToImageData(fullCanvas as any),
      canvasToImageData(offCanvas as any)
    );
    expect(delta).toBeLessThan(20);
  }, 30000);

  it('preserveFinders=false keeps non-finder module data contrast in full profile', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const cfg: QRGeneratorConfig = {
      content: 'https://anqr.link',
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 20,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: 'dithered',
      overlayIntensity: 90,
      colorMode: 'color',
      ditherKind: 'error_diffusion',
      ditherStrength: 50,
      ditherSerpentine: false,
      diffusionKernel: 'floyd_steinberg',
      renderScalePerModule: 18,
      seed: 42,
      preserveFinders: false,
      preserveTiming: true,
      preserveAlignment: true,
      protectFormatInfo: true,
      protectVersionInfo: true,
      scanGateProfile: 'full',
    };

    const canvas = await qr.generate(cfg, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();

    const polarity = meanModuleCenterLumaByBitMasked(
      canvas as any,
      matrixData!.matrix,
      cfg.margin,
      (row, col, moduleCount, version) =>
        !(
          isFinderModuleOrSeparator(row, col, moduleCount) ||
          isTimingPattern(row, col, moduleCount) ||
          isAlignmentPattern(row, col, moduleCount, version) ||
          isFormatInfo(row, col, moduleCount) ||
          isVersionInfo(row, col, moduleCount, version) ||
          (row === moduleCount - 8 && col === 8)
        )
    );

    expect(polarity.darkCount).toBeGreaterThan(100);
    expect(polarity.lightCount).toBeGreaterThan(100);
    expect(polarity.darkMean).toBeLessThan(polarity.lightMean - 0.04);
  }, 30000);

  it('preserveTiming toggle is localized to timing patterns', async () => {
    await expectToggleLocality(
      { preserveTiming: false },
      (row, col, moduleCount) => isTimingPattern(row, col, moduleCount),
      'preserveTiming'
    );
  }, 30000);

  it('preserveAlignment toggle is localized to alignment patterns', async () => {
    await expectToggleLocality(
      { preserveAlignment: false },
      (row, col, moduleCount, version) => isAlignmentPattern(row, col, moduleCount, version),
      'preserveAlignment'
    );
  }, 30000);

  it('protectFormatInfo toggle is localized to format modules', async () => {
    await expectToggleLocality(
      { protectFormatInfo: false },
      (row, col, moduleCount) => isFormatInfo(row, col, moduleCount),
      'protectFormatInfo'
    );
  }, 30000);

  it('protectVersionInfo toggle is localized to version modules', async () => {
    await expectToggleLocality(
      { protectVersionInfo: false },
      (row, col, moduleCount, version) => isVersionInfo(row, col, moduleCount, version),
      'protectVersionInfo'
    );
  }, 30000);
});
