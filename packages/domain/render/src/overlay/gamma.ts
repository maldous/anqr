export function gamma(imageData: ImageData, value: number): ImageData {
  const data = imageData.data;
  const invGamma = 1 / value;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(255 * (data[i] / 255) ** invGamma);
    data[i + 1] = Math.round(255 * (data[i + 1] / 255) ** invGamma);
    data[i + 2] = Math.round(255 * (data[i + 2] / 255) ** invGamma);
  }

  return imageData;
}
