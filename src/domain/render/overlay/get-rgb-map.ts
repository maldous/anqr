export function getRGBMap(imageData: ImageData): {
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
} {
  const data = imageData.data;
  const size = data.length / 4;
  const r = new Float32Array(size);
  const g = new Float32Array(size);
  const b = new Float32Array(size);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    r[idx] = data[i] / 255;
    g[idx] = data[i + 1] / 255;
    b[idx] = data[i + 2] / 255;
  }

  return { r, g, b };
}
