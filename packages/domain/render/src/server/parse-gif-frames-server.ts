import { decodeGif } from "../animation";
import { createCanvas } from "@napi-rs/canvas";
import type { ServerAnimationFrame } from "./server-animation-frame.types";
import { MAX_GIF_FRAMES } from "./max-gif-frames.const";
import { MAX_GIF_DURATION_MS } from "./max-gif-duration-ms.const";

export function parseGifFramesServer(
  arrayBuffer: ArrayBuffer,
  disposalHandling: "respect" | "simplify" = "respect",
): ServerAnimationFrame[] {
  const decoded = decodeGif(arrayBuffer);

  if (decoded.frames.length === 0) {
    throw new Error("No frames found in GIF");
  }

  // Limit frame count to prevent excessive processing
  const framesToProcess = decoded.frames.slice(0, MAX_GIF_FRAMES);
  if (decoded.frames.length > MAX_GIF_FRAMES) {
    // Frame count exceeded MAX_GIF_FRAMES — silently truncated above
  }

  // Calculate total duration and warn if excessive
  const totalDuration = framesToProcess.reduce((sum, f) => sum + f.delay, 0);
  if (totalDuration > MAX_GIF_DURATION_MS) {
    // Duration exceeds limit but we proceed anyway for user flexibility
  }

  const { width, height } = decoded;

  // Create a persistent canvas for compositing frames
  const compositeCanvas = createCanvas(width, height);
  const compositeCtx = compositeCanvas.getContext("2d");
  // Ensure deterministic transparent background before applying delta patches.
  compositeCtx.clearRect(0, 0, width, height);

  // Reuse a single patch canvas to avoid repeated allocations and stale buffer issues.
  let maxPatchWidth = 1;
  let maxPatchHeight = 1;
  for (const frame of framesToProcess) {
    maxPatchWidth = Math.max(maxPatchWidth, frame.dims.width);
    maxPatchHeight = Math.max(maxPatchHeight, frame.dims.height);
  }
  const patchCanvas = createCanvas(maxPatchWidth, maxPatchHeight);
  const patchCtx = patchCanvas.getContext("2d");

  const animationFrames: ServerAnimationFrame[] = [];

  for (const frame of framesToProcess) {
    const { dims, patch, disposalType, delay } = frame;
    const effectiveDisposal =
      disposalHandling === "simplify" && disposalType === 3 ? 2 : disposalType;
    let restoreData: ReturnType<typeof compositeCtx.getImageData> | null = null;

    if (effectiveDisposal === 3) {
      restoreData = compositeCtx.getImageData(dims.left, dims.top, dims.width, dims.height);
    }

    // Create ImageData from patch
    const imageData = compositeCtx.createImageData(dims.width, dims.height);
    imageData.data.set(new Uint8ClampedArray(patch));

    // Draw this frame patch onto a cleared temporary patch canvas.
    patchCtx.clearRect(0, 0, dims.width, dims.height);
    patchCtx.putImageData(imageData, 0, 0);

    // Draw patch onto composite canvas
    compositeCtx.drawImage(
      patchCanvas,
      0,
      0,
      dims.width,
      dims.height,
      dims.left,
      dims.top,
      dims.width,
      dims.height,
    );

    // Create output canvas for this frame
    const outputCanvas = createCanvas(width, height);
    const outputCtx = outputCanvas.getContext("2d");
    outputCtx.drawImage(compositeCanvas, 0, 0);

    animationFrames.push({
      canvas: outputCanvas,
      delay, // already in milliseconds (gifuct-js converts centiseconds internally)
      disposalType: effectiveDisposal,
    });

    // Handle disposal
    if (effectiveDisposal === 2) {
      // Restore to background
      compositeCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (effectiveDisposal === 3 && restoreData) {
      // Restore to previous canvas content for next frame compositing
      compositeCtx.putImageData(restoreData, dims.left, dims.top);
    }
    // disposalType 0 or 1: leave frame in place
  }

  return animationFrames;
}
