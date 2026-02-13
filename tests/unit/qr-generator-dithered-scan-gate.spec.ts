import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
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

async function loadOverlayCanvas(filePath: string, size: number): Promise<any> {
  const img = await loadImage(filePath);
  const overlay = createCanvas(size, size);
  const ctx = overlay.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img as any, 0, 0, size, size);
  return overlay as any;
}

describe('qr-generator dithered scan gate', () => {
  it('keeps dithered tsunami output decodable from final PNG bytes', async () => {
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

    const overlay = await loadOverlayCanvas(path.join(process.cwd(), 'public/tsunami.jpg'), 200);
    const generated = await qr.generate(cfg, overlay);
    const pngBuffer = (generated as any).toBuffer('image/png');
    if (process.env.SAVE_QR_ARTIFACT === '1') {
      fs.writeFileSync(path.join(process.cwd(), 'tsunami-generated-current.png'), pngBuffer);
    }

    const generatedImageData = canvasToImageData(generated as any);
    const decodedCanvas = decodeQR(generatedImageData, {
      inversionAttempts: 'attemptBoth',
    });
    expect(decodedCanvas?.data).toBe(payload);
    expect(meanChromaDistance(generatedImageData)).toBeGreaterThan(3);
    const roundtripImage = await loadImage(pngBuffer);
    const roundtripCanvas = createCanvas((generated as any).width, (generated as any).height);
    const roundtripCtx = roundtripCanvas.getContext('2d');
    roundtripCtx.drawImage(roundtripImage as any, 0, 0, roundtripCanvas.width, roundtripCanvas.height);

    const decodedRoundtrip = decodeQR(canvasToImageData(roundtripCanvas as any), {
      inversionAttempts: 'attemptBoth',
    });
    expect(decodedRoundtrip?.data).toBe(payload);
  });
});
