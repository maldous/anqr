import {x, y} from './shared';
export function calculateImageProperties(
  imageData: ImageData,
  location: QRLocation | null,
  moduleCount: number | null
): QRAnalysisResult['imageProperties'] {
  const { width, height } = imageData;
  const aspectRatio = Math.round((width / height) * 100) / 100;
  
  // Estimate QR code size in pixels
  let estimatedQrSizePx = 0;
  if (location && moduleCount) {
    const topWidth = Math.sqrt(
      Math.pow(location.topRight.x - location.topLeft.x, 2) +
      Math.pow(location.topRight.y - location.topLeft.y, 2)
    );
    const leftHeight = Math.sqrt(
      Math.pow(location.bottomLeft.x - location.topLeft.x, 2) +
      Math.pow(location.bottomLeft.y - location.topLeft.y, 2)
    );
    estimatedQrSizePx = Math.round((topWidth + leftHeight) / 2);
  }
  
  return {
    width,
    height,
    aspectRatio,
    estimatedQrSizePx,
  };
}

