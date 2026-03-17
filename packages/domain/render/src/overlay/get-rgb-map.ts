import { createRGBMap } from "./create-rgb-map";

export function getRGBMap(imageData: ImageData): {
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
} {
  return createRGBMap(imageData.data);
}
