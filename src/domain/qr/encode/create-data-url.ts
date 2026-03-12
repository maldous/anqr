import { gifImage } from './gif-image';
import { byteArrayOutputStream } from './byte-array-output-stream';
import { base64EncodeOutputStream } from './base64-encode-output-stream';

/**
 * Create a data URL from pixel data
 */
export function createDataURL(
  width: number,
  height: number,
  getPixel: (x: number, y: number) => number
): string {
  const gif = gifImage(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      gif.setPixel(x, y, getPixel(x, y));
    }
  }

  const b = byteArrayOutputStream();
  gif.write(b);

  const base64 = base64EncodeOutputStream();
  const bytes = b.toByteArray();
  for (let i = 0; i < bytes.length; i += 1) {
    base64.writeByte(bytes[i]);
  }
  base64.flush();

  return `data:image/gif;base64,${base64.toString()}`;
}
