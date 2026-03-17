import type { CanvasFactory } from "./canvas-factory.types";

/**
 * Default browser canvas factory - uses DOM APIs
 * Exported for reference/extension by custom factories
 */
export const defaultBrowserCanvasFactory: CanvasFactory = {
  createCanvas: (width: number, height: number): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return Promise.resolve(canvas);
  },
  loadImage: (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },
};
