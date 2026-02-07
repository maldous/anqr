import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { decodeQRFromCanvas } from '../../src/modules/qr-analyzer';
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

describe('qr-analyzer geometry diagnostics', () => {
  it('includes corners, bounding box, and rotation', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const config: QRGeneratorConfig = {
      content: 'https://example.com/geometry-check',
      errorCorrection: 'H',
      typeNumber: 0,
      moduleSize: 8,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
    };

    const canvas = await qr.generate(config, null);
    const analysis = decodeQRFromCanvas(canvas as any);

    expect(analysis.success).toBe(true);
    expect(analysis.geometry).toBeDefined();
    expect(analysis.geometry?.boundingBox.width).toBeGreaterThan(0);
    expect(analysis.geometry?.boundingBox.height).toBeGreaterThan(0);
    expect(Math.abs(analysis.geometry?.estimatedRotationDeg ?? 999)).toBeLessThan(5);
  });
});

