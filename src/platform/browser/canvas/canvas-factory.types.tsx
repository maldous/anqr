/**
 * Canvas factory interface for environment-agnostic canvas creation.
 * Allows QRGenerator to work in both browser and Node.js (Netlify functions).
 */
export interface CanvasFactory {
  createCanvas(width: number, height: number): Promise<HTMLCanvasElement | OffscreenCanvas>;
  loadImage?(src: string): Promise<HTMLImageElement>;
}
