import { copyImageData, gamma, gaussianBlur } from "@/modules/overlay";
import { log } from "./log";

/**
 * Soften a high-contrast B&W image to create gradients for better dithering.
 *
 * Applies:
 * 1. Gaussian blur (radius 2) to create soft transitions at hard edges
 * 2. Gamma correction (0.65) to push values toward midtones
 *
 * This transforms harsh B&W patterns into smooth gradients that dithering
 * algorithms can work with effectively.
 *
 * @param imageData - The image data to soften (will be copied, not mutated)
 * @returns Softened image data with gradients
 */
export function softenBWImage(imageData: ImageData): ImageData {
  log.debug("Softening B&W image for better dithering");

  // First copy to avoid mutating original
  let result = copyImageData(imageData);

  // Apply Gaussian blur to create gradients at edges
  // Radius 3 creates wide enough transitions for dithering to work with
  result = gaussianBlur(result, 3);

  // Apply gamma correction to push values toward midtones
  // Gamma < 1 lightens midtones, creating more variation for dithering
  result = gamma(result, 0.65);

  return result;
}
