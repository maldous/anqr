import { type Canvas } from "@napi-rs/canvas";

export interface FetchedImage {
  canvas: Canvas;
  arrayBuffer: ArrayBuffer;
  isAnimatedGif: boolean;
}
