import {DetectedColors, lighter, luminance, pixel, x, y} from './shared';
import { averageColor } from './averageColor';
import { calculateContrastRatio } from './calculateContrastRatio';
import { createColorSampleTransform } from './createColorSampleTransform';
import { rgbToHex } from './rgbToHex';
export function extractDominantColors(
  imageData: ImageData,
  moduleMatrix: boolean[][] | null,
  location: QRLocation | null,
  moduleCount: number
): DetectedColors | null {
  if (!moduleMatrix || !location) {
    return null;
  }

  const { width, height, data } = imageData;
  const transform = createColorSampleTransform(location, moduleCount);

  const darkPixels: Array<{ r: number; g: number; b: number }> = [];
  const lightPixels: Array<{ r: number; g: number; b: number }> = [];

  // Sample pixels at module centers
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const { x, y } = transform(col, row);
      const px = Math.round(x);
      const py = Math.round(y);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        const pixel = {
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
        };

        if (moduleMatrix[row]?.[col]) {
          darkPixels.push(pixel);
        } else {
          lightPixels.push(pixel);
        }
      }
    }
  }

  if (darkPixels.length === 0 || lightPixels.length === 0) {
    return null;
  }

  // Calculate average colors
  let foregroundRgb = averageColor(darkPixels);
  let backgroundRgb = averageColor(lightPixels);

  // Check if colors are inverted (foreground lighter than background)
  // This can happen when the matrix was inverted during extraction
  // Calculate relative luminance for comparison
  const fgLuminance = 0.299 * foregroundRgb.r + 0.587 * foregroundRgb.g + 0.114 * foregroundRgb.b;
  const bgLuminance = 0.299 * backgroundRgb.r + 0.587 * backgroundRgb.g + 0.114 * backgroundRgb.b;
  
  // If foreground is lighter than background, swap them
  if (fgLuminance > bgLuminance) {
    const temp = foregroundRgb;
    foregroundRgb = backgroundRgb;
    backgroundRgb = temp;
  }

  // Calculate contrast ratio
  const contrastRatio = calculateContrastRatio(foregroundRgb, backgroundRgb);

  return {
    foreground: rgbToHex(foregroundRgb),
    background: rgbToHex(backgroundRgb),
    foregroundRgb,
    backgroundRgb,
    contrastRatio,
  };
}

