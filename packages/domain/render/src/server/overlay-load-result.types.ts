import { type Canvas } from "@napi-rs/canvas";
import type { ServerAnimationFrame } from "./server-animation-frame.types";
import type { OutputFormat } from "./output-format.types";

export interface OverlayLoadResult {
  overlayCanvas: Canvas | null;
  overlayFrames: ServerAnimationFrame[];
  hasAnimatedOverlay: boolean;
  outputFormat: OutputFormat;
}
