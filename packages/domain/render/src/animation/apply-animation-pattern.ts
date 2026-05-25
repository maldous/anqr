/**
 * Apply Animation Pattern
 * Apply visual effects to animation frames
 */

import { createLogger } from "@/domain/logging";
import { createCanvasLike } from "./create-canvas-like";
import { resetCanvas2D } from "./reset-canvas-2d";
import { resolveEffectBounds } from "./resolve-effect-bounds";

const _log = createLogger("ANIMATION");

import type { AnimationOptions, AnimationPattern } from "../animation/types";

/**
 * Apply animation pattern to a frame
 */
export function applyAnimationPattern(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  frameIndex: number,
  totalFrames: number,
  pattern: AnimationPattern,
  options: Partial<AnimationOptions> = {},
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas,
): HTMLCanvasElement | OffscreenCanvas {
  if (pattern === "none") return canvas;

  const result = createCanvasLike(canvas, targetCanvas);
  const ctx = resetCanvas2D(result);
  if (!ctx) return canvas;

  const progress = frameIndex / Math.max(1, totalFrames - 1);
  const seed = options.seed ?? 0;
  const bounds = resolveEffectBounds(canvas, options);

  switch (pattern) {
    case "pulse": {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
      const offset = ((1 - scale) * canvas.width) / 2;
      ctx.drawImage(
        canvas as CanvasImageSource,
        offset,
        offset,
        canvas.width * scale,
        canvas.height * scale,
      );
      break;
    }

    case "wave": {
      // A-F2: was issuing up to 1024 sub-pixel drawImage calls per frame
      // (512 for axis y/x, 1024 for xy at 512²). Replaced with a single
      // ImageData read, in-JS row/column shifts, single ImageData write.
      // Output identical — same `Math.round(Math.sin(...) * amplitude)`
      // arithmetic, just applied as pixel-buffer copies instead of canvas
      // blits. Falls back to the original drawImage loop if getImageData
      // isn't available (test/mocked contexts).
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      const axis = options.waveAxis || "y";
      const amplitude = 2;
      const waveScale = 0.1;

      const sourceCtx = (canvas as HTMLCanvasElement).getContext?.("2d");
      const src = sourceCtx?.getImageData?.(0, 0, canvas.width, canvas.height);
      if (!src) {
        // Test/mocked context lacks getImageData — keep the original
        // per-row drawImage loops so the visual output is still correct.
        if (axis === "y" || axis === "xy") {
          for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            const offsetX = Math.round(
              Math.sin((y + progress * canvas.height + seed) * waveScale) * amplitude,
            );
            ctx.drawImage(
              canvas as CanvasImageSource,
              bounds.x, y, bounds.width, 1,
              bounds.x + offsetX, y, bounds.width, 1,
            );
          }
        }
        if (axis === "x" || axis === "xy") {
          for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
            const offsetY = Math.round(
              Math.sin((x + progress * canvas.width + seed) * waveScale) * amplitude,
            );
            ctx.drawImage(
              canvas as CanvasImageSource,
              x, bounds.y, 1, bounds.height,
              x, bounds.y + offsetY, 1, bounds.height,
            );
          }
        }
        break;
      }

      const W = canvas.width;
      const H = canvas.height;
      const dst = new Uint8ClampedArray(src.data);

      if (axis === "y" || axis === "xy") {
        // Per-row horizontal shift: copy contiguous row bytes (W*4) from
        // src to dst at shifted column offset. Typed-array .set is one
        // memcpy per row instead of a drawImage state setup.
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
          const offsetX = Math.round(
            Math.sin((y + progress * canvas.height + seed) * waveScale) * amplitude,
          );
          if (offsetX === 0) continue;
          const dstX = bounds.x + offsetX;
          const dstStart = Math.max(0, dstX);
          const dstEnd = Math.min(W, dstX + bounds.width);
          const copyLen = dstEnd - dstStart;
          if (copyLen <= 0) continue;
          const srcAdjust = dstStart - dstX;
          const rowBase = y * W * 4;
          const srcByteStart = rowBase + (bounds.x + srcAdjust) * 4;
          const dstByteStart = rowBase + dstStart * 4;
          dst.set(
            src.data.subarray(srcByteStart, srcByteStart + copyLen * 4),
            dstByteStart,
          );
        }
      }

      if (axis === "x" || axis === "xy") {
        // Per-column vertical shift: column bytes aren't contiguous, so
        // copy pixel-by-pixel (4 bytes per pixel). Reads from `src` so
        // axis="xy" applies x-shift to the ORIGINAL canvas content
        // (matches the prior drawImage(canvas, ...) per-column source).
        const srcData = src.data;
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
          const offsetY = Math.round(
            Math.sin((x + progress * canvas.width + seed) * waveScale) * amplitude,
          );
          if (offsetY === 0) continue;
          for (let row = 0; row < bounds.height; row++) {
            const srcY = bounds.y + row;
            const dstY = bounds.y + row + offsetY;
            if (dstY < 0 || dstY >= H) continue;
            const srcIdx = (srcY * W + x) * 4;
            const dstIdx = (dstY * W + x) * 4;
            dst[dstIdx] = srcData[srcIdx];
            dst[dstIdx + 1] = srcData[srcIdx + 1];
            dst[dstIdx + 2] = srcData[srcIdx + 2];
            dst[dstIdx + 3] = srcData[srcIdx + 3];
          }
        }
      }

      ctx.putImageData(new ImageData(dst, W, H), 0, 0);
      break;
    }

    case "scanline": {
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      const scanY = Math.floor(progress * canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, scanY - 2, canvas.width, 4);
      break;
    }

    case "shimmer": {
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      if (typeof (ctx as CanvasRenderingContext2D).createLinearGradient !== "function") {
        // Test/mocked contexts may not implement gradients; fall back gracefully.
        break;
      }
      const bandWidth = Math.max(16, Math.floor(bounds.width * 0.2));
      const sweep =
        ((progress * 1.2 + (Math.sin(seed * 0.1234) + 1) * 0.5) % 1) *
          (bounds.width + bandWidth * 2) -
        bandWidth;
      const gradient = ctx.createLinearGradient(
        bounds.x + sweep - bandWidth,
        bounds.y,
        bounds.x + sweep + bandWidth,
        bounds.y + bounds.height,
      );
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.24)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = gradient;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.globalCompositeOperation = "source-over";
      break;
    }

    case "drift": {
      const driftX = Math.sin(progress * Math.PI * 2) * 3;
      const driftY = Math.cos(progress * Math.PI * 2) * 3;
      ctx.drawImage(canvas as CanvasImageSource, driftX, driftY);
      break;
    }

    default:
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  }

  return result;
}
