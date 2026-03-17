import { type Canvas } from "@napi-rs/canvas";

export interface ServerAnimationFrame {
  canvas: Canvas;
  delay: number; // milliseconds
  disposalType: number;
}
