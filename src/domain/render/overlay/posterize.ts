export function posterize(imageData: ImageData, levels: number): ImageData {
  const data = imageData.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }

  return imageData;
}
