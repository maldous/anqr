import { blurServer } from "./blur-server.ts";
import { sharpenServer } from "./sharpen-server.ts";
import { posterizeServer } from "./posterize-server.ts";
import { thresholdServer } from "./threshold-server.ts";
import { sobelEdgeServer } from "./sobel-edge-server.ts";
import { cannyEdgeServer } from "./canny-edge-server.ts";

export function applyPostProcessFilters(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  blurRadius: number,
  sharpenAmount: number,
  posterizeLevels: number,
  thresholdLevel: number | undefined,
  edgeMode: string,
): void {
  if (blurRadius > 0) data.set(blurServer(data, width, height, blurRadius));
  if (sharpenAmount > 0) data.set(sharpenServer(data, width, height, sharpenAmount));
  if (posterizeLevels > 1) data.set(posterizeServer(data, posterizeLevels));
  if (thresholdLevel !== undefined) data.set(thresholdServer(data, thresholdLevel));
  if (edgeMode === "sobel") data.set(sobelEdgeServer(data, width, height));
  else if (edgeMode === "canny") data.set(cannyEdgeServer(data, width, height));
}
