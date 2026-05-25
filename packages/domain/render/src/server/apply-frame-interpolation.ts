import { type Canvas } from "@napi-rs/canvas";
import type { AnimationInterpolation } from "./animation-interpolation.types";
import { interpolateOverlayFramesServer } from "./interpolate-overlay-frames-server";

// A-F8 (review-2026-05-24): t=0.5 is INTENTIONAL, not a placeholder.
//
// The server and client implement crossfade/morph interpolation with
// fundamentally different strategies:
//   * Client (applyInterpolationToFrames): inserts EXTRA interpolated
//     frames at t=1/3 and t=2/3 between every existing pair. Frame count
//     grows from N to ~3N.
//   * Server (this function): REPLACES each frame with a 50/50 blend of
//     itself and its predecessor. Frame count stays at N.
// On the server there is exactly ONE blend per output frame — between
// the current frame and the previous one — so t=0.5 (equal weight on
// both) is the only meaningful value. Changing it would skew the
// motion-blur direction without changing the output frame count.
// Documented here so future maintainers don't "fix" it.
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
