// ============================================
// BASIC FILTERS
// ============================================

export function brightness(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  const factor = amount / 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, Math.round(data[i] + 255 * factor)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] + 255 * factor)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] + 255 * factor)));
  }

  return imageData;
}
