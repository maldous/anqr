import { type Canvas } from "@napi-rs/canvas";
import { AnimationInterpolation } from "./animation-interpolation.types.ts";
import { interpolateOverlayFramesServer } from "./interpolate-overlay-frames-server.ts";

export function applyFrameInterpolation(
  currentCanvas: Canvas,
  previousCanvas: Canvas | null,
  interpolationMode: AnimationInterpolation,
): Canvas {
  if ((interpolationMode === "crossfade" || interpolationMode === "morph") && previousCanvas) {
    return interpolateOverlayFramesServer(previousCanvas, currentCanvas, interpolationMode, 0.5);
  }
  return currentCanvas;
}
