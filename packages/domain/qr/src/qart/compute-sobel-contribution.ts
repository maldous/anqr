import { rgbToLumaLinear } from "@/domain/render/color";

export function computeSobelContribution(
  imageData: ImageData,
  imgX: number,
  imgY: number,
  maxX: number,
  maxY: number,
): { sobelX: number; sobelY: number } {
  const nx = Math.max(0, Math.min(maxX, imgX + 1));
  const px = Math.max(0, Math.min(maxX, imgX - 1));
  const ny = Math.max(0, Math.min(maxY, imgY + 1));
  const py = Math.max(0, Math.min(maxY, imgY - 1));

  const idxPx = (imgY * imageData.width + px) * 4;
  const idxNx = (imgY * imageData.width + nx) * 4;
  const idxPy = (py * imageData.width + imgX) * 4;
  const idxNy = (ny * imageData.width + imgX) * 4;

  const lPx =
    rgbToLumaLinear(imageData.data[idxPx], imageData.data[idxPx + 1], imageData.data[idxPx + 2]) *
    255;
  const lNx =
    rgbToLumaLinear(imageData.data[idxNx], imageData.data[idxNx + 1], imageData.data[idxNx + 2]) *
    255;
  const lPy =
    rgbToLumaLinear(imageData.data[idxPy], imageData.data[idxPy + 1], imageData.data[idxPy + 2]) *
    255;
  const lNy =
    rgbToLumaLinear(imageData.data[idxNy], imageData.data[idxNy + 1], imageData.data[idxNy + 2]) *
    255;

  return { sobelX: lNx - lPx, sobelY: lNy - lPy };
}
