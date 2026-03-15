export function invertImageData(imageData: ImageData): ImageData {
  const inverted = new ImageData(
    new Uint8ClampedArray(imageData.data.length),
    imageData.width,
    imageData.height
  );
  for (let i = 0; i < imageData.data.length; i += 4) {
    inverted.data[i] = 255 - imageData.data[i];
    inverted.data[i + 1] = 255 - imageData.data[i + 1];
    inverted.data[i + 2] = 255 - imageData.data[i + 2];
    inverted.data[i + 3] = imageData.data[i + 3];
  }
  return inverted;
}
