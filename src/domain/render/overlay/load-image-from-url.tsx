import { drawImageToCanvas } from './draw-image-to-canvas';

export function loadImageFromUrl(url: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        resolve(drawImageToCanvas(img));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
}
