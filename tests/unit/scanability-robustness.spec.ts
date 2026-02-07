import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { scanImageData, validateOverlayIntensity } from '../../src/modules/qr-analyzer';
import { decodeQR } from '../../src/modules/qr-decoder';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';

if (typeof globalThis.ImageData === 'undefined') {
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

if (typeof globalThis.HTMLCanvasElement === 'undefined') {
  const ctor = Object.getPrototypeOf(createCanvas(1, 1)).constructor;
  (globalThis as Record<string, unknown>).HTMLCanvasElement = ctor;
}

const nodeCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => createCanvas(width, height) as any,
};

function canvasToImageData(canvas: any): ImageData {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: imageData.data, width, height } as ImageData;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addNoise(input: ImageData, amount: number, seed: number): ImageData {
  const out = new Uint8ClampedArray(input.data);
  const rand = mulberry32(seed);
  for (let i = 0; i < out.length; i += 4) {
    const delta = Math.round((rand() * 2 - 1) * amount);
    out[i] = Math.max(0, Math.min(255, out[i] + delta));
    out[i + 1] = Math.max(0, Math.min(255, out[i + 1] + delta));
    out[i + 2] = Math.max(0, Math.min(255, out[i + 2] + delta));
  }
  return { data: out, width: input.width, height: input.height } as ImageData;
}

function boxBlur(input: ImageData, radius: number): ImageData {
  const { width, height, data } = input;
  const out = new Uint8ClampedArray(data.length);
  const r = Math.max(1, radius);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rs = 0;
      let gs = 0;
      let bs = 0;
      let as = 0;
      let count = 0;
      for (let oy = -r; oy <= r; oy++) {
        for (let ox = -r; ox <= r; ox++) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const idx = (ny * width + nx) * 4;
          rs += data[idx];
          gs += data[idx + 1];
          bs += data[idx + 2];
          as += data[idx + 3];
          count++;
        }
      }
      const outIdx = (y * width + x) * 4;
      out[outIdx] = Math.round(rs / count);
      out[outIdx + 1] = Math.round(gs / count);
      out[outIdx + 2] = Math.round(bs / count);
      out[outIdx + 3] = Math.round(as / count);
    }
  }

  return { data: out, width, height } as ImageData;
}

function buildOverlayCanvas(size: number): any {
  const overlay = createCanvas(size, size);
  const ctx = overlay.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#808080');
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return overlay as any;
}

describe('scanability robustness', () => {
  it('stays decodable at ECC-safe overlay intensities under mild perturbations', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const eccLevels = ['L', 'M', 'Q', 'H'] as const;
    const conservativeIntensityByEcc: Record<(typeof eccLevels)[number], number> = {
      L: 18,
      M: 32,
      Q: 48,
      H: 60,
    };

    for (const ecc of eccLevels) {
      const payload = `https://example.com/scanability/${ecc}`;
      const cfg: QRGeneratorConfig = {
        content: payload,
        errorCorrection: ecc,
        typeNumber: 0,
        moduleSize: 10,
        margin: 4,
        fgColor: '#000000',
        bgColor: '#ffffff',
        overlayMode: 'blend',
        overlayIntensity: conservativeIntensityByEcc[ecc],
        colorMode: 'color',
      };

      const canvas = await qr.generate(cfg, buildOverlayCanvas(192));
      const base = canvasToImageData(canvas as any);
      const blurred = boxBlur(base, 1);
      const noisy = addNoise(base, 6, 1234 + ecc.charCodeAt(0));

      for (const variant of [base, blurred, noisy]) {
        const decoded = decodeQR(variant);
        const scanned = scanImageData(variant);
        expect(decoded?.data).toBe(payload);
        expect(scanned.data).toBe(payload);
      }
    }
  });

  it('flags intensity above ECC-safe thresholds', () => {
    expect(validateOverlayIntensity(31, 'L').valid).toBe(false);
    expect(validateOverlayIntensity(51, 'M').valid).toBe(false);
    expect(validateOverlayIntensity(71, 'Q').valid).toBe(false);
    expect(validateOverlayIntensity(86, 'H').valid).toBe(false);
  });
});
