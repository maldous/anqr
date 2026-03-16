import { type Canvas } from "@napi-rs/canvas";
import { ServerAnimationFrame } from "./server-animation-frame.types.ts";
import { OutputFormat } from "./output-format.types.ts";

export interface OverlayLoadResult {
  overlayCanvas: Canvas | null;
  overlayFrames: ServerAnimationFrame[];
  hasAnimatedOverlay: boolean;
  outputFormat: OutputFormat;
}
