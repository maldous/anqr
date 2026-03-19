import { copyImageData, gamma, gaussianBlur } from "./overlay-filters";
import { log } from "./log";

export function softenBWImage(imageData: ImageData): ImageData {
  log.debug("Softening B&W image for better dithering");

  let result = copyImageData(imageData);
  result = gaussianBlur(result, 3);
  result = gamma(result, 0.65);

  return result;
}
