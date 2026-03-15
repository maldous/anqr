import { resolveEffectTargetCanvas } from '../resolve-effect-target-canvas';

/**
 * Apply temporal dither offset to a canvas by modifying pixel values slightly
 * This provides temporal dithering for modes that don't support native offset passing
 */
export function applyTemporalNoiseToCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  offset: number,
  strength: number = 0.02,
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  if (offset === 0 || strength === 0) {
    return canvas;
  }

  const { ctx, result } = resolveEffectTargetCanvas(canvas, targetCanvas);
  if (!ctx) {
    return canvas as HTMLCanvasElement;
  }

  if ('setTransform' in ctx && typeof ctx.setTransform === 'function') {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if ('filter' in ctx) {
    (ctx as CanvasRenderingContext2D).filter = 'none';
  }
  ctx.clearRect(0, 0, result.width, result.height);

  // Draw original
  ctx.drawImage(canvas, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;

  // Apply subtle temporal noise based on offset
  // This creates slight variations that integrate over time for smoother perceived quality
  const phi = 1.618033988749895;

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % result.width;
    const y = Math.floor(i / 4 / result.width);

    // Generate position-dependent noise that varies with temporal offset
    const noise = ((x * phi + y * phi * phi + offset * 1000) % 1) - 0.5;
    const adjustment = Math.round(noise * strength * 255);

    // Apply small adjustment to RGB channels
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
    // Alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}
