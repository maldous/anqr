export function posterizeServer(data: Uint8ClampedArray, levels: number): Uint8ClampedArray {
  if (levels <= 1) return data;
  const result = new Uint8ClampedArray(data);
  const step = 255 / (levels - 1);

  for (let i = 0; i < result.length; i += 4) {
    result[i] = Math.round(Math.round(result[i] / step) * step);
    result[i + 1] = Math.round(Math.round(result[i + 1] / step) * step);
    result[i + 2] = Math.round(Math.round(result[i + 2] / step) * step);
  }

  return result;
}
