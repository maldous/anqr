import {for, i, idx, imageData, total} from '../shared';
import { lumaAt } from '../luma/lumaAt';

export function buildLumaBuffer(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  const total = width * height;
  const luma = new Uint8Array(total);

  for (let i = 0; i < total; i++) {
    const idx = i * 4;
    luma[i] = lumaAt(data, idx);
  }

  return luma;
}

