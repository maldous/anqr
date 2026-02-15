import { describe, expect, it } from 'vitest';
import { createCanvas } from '@napi-rs/canvas';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';
import { decodeQR } from '../../src/modules/qr-decoder';

// Polyfill ImageData for Node.js
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

function getImageData(canvas: any) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: imageData.data, width, height } as ImageData;
}

describe('qr-generator decode', () => {
  it('generates a scannable QR without overlay', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const config: QRGeneratorConfig = {
      content: 'https://example.com/generator-test',
      errorCorrection: 'M',
      typeNumber: 0,
      moduleSize: 6,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
    };

    const canvas = await qr.generate(config, null);
    const imageData = getImageData(canvas as any);
    const decoded = decodeQR(imageData);
    expect(decoded?.data).toBe(config.content);
  });

  it(
    'generates a scannable QR with overlay canvas',
    async () => {
      const qr = new QRGenerator(nodeCanvasFactory);
      const config: QRGeneratorConfig = {
        content: 'https://example.com/generator-overlay',
        errorCorrection: 'H',
        typeNumber: 0,
        moduleSize: 6,
        margin: 4,
        fgColor: '#000000',
        bgColor: '#ffffff',
        overlayMode: 'dithered',
        overlayIntensity: 60,
        colorMode: 'color',
      };

      const overlay = createCanvas(128, 128);
      const octx = overlay.getContext('2d');
      const grad = octx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#000000');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 128, 128);

      const canvas = await qr.generate(config, overlay as any);
      const imageData = getImageData(canvas as any);
      const decoded = decodeQR(imageData);
      expect(decoded?.data).toBe(config.content);
    },
    30000
  );
});
