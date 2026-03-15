export function applyWatermarkCenterLogo(
  sourceCanvas: HTMLCanvasElement,
  logoCanvas: HTMLCanvasElement,
  maxSizePercent: number = 20,
  opacity: number = 1
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Draw source
  ctx.drawImage(sourceCanvas, 0, 0);

  // Calculate logo size
  const maxSize = Math.min(result.width, result.height) * (maxSizePercent / 100);
  const logoAspect = logoCanvas.width / logoCanvas.height;
  let logoWidth = maxSize;
  let logoHeight = maxSize / logoAspect;

  if (logoHeight > maxSize) {
    logoHeight = maxSize;
    logoWidth = maxSize * logoAspect;
  }

  // Center position
  const x = (result.width - logoWidth) / 2;
  const y = (result.height - logoHeight) / 2;

  // Draw logo
  ctx.globalAlpha = opacity;
  ctx.drawImage(logoCanvas, x, y, logoWidth, logoHeight);
  ctx.globalAlpha = 1;

  return result;
}
