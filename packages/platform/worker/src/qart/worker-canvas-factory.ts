import { QRGenerator, type CanvasFactory } from "@/modules/qr-generator";

export const workerCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => new OffscreenCanvas(width, height),
};

export const workerRenderer = new QRGenerator(workerCanvasFactory);
