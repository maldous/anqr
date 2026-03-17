import { type Canvas } from "@napi-rs/canvas";
import { ServerAnimationFrame } from "./server-animation-frame.types";
import { OutputFormat } from "./output-format.types";

export interface OverlayLoadResult {
  overlayCanvas: Canvas | null;
  overlayFrames: ServerAnimationFrame[];
  hasAnimatedOverlay: boolean;
  outputFormat: OutputFormat;
}
