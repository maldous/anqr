import { loadImageFromUrl } from './load-image-from-url';

export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLCanvasElement> {
  return loadImageFromUrl(dataUrl);
}
