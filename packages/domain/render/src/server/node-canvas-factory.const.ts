import { createCanvas, loadImage } from "@napi-rs/canvas";

export const nodeCanvasFactory = {
  createCanvas: async (width: number, height: number) => {
    return createCanvas(width, height);
  },
  loadImage: async (src: string | Buffer | URL | ArrayBuffer) => {
    return loadImage(src);
  },
};
