/**
 * Frame Interpolation
 * Interpolate between animation frames
 */

/**
 * Interpolate between two frames
 */
export function interpolateFrames(
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number,
  mode: 'none' | 'crossfade' | 'morph'
): HTMLCanvasElement {
  if (mode === 'none' || t === 0) return frame1 as HTMLCanvasElement;
  if (t === 1) return frame2 as HTMLCanvasElement;

  const result = document.createElement('canvas');
  result.width = frame1.width;
  result.height = frame1.height;
  const ctx = result.getContext('2d');
  if (!ctx) return frame1 as HTMLCanvasElement;

  switch (mode) {
    case 'crossfade': {
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
      ctx.globalAlpha = t;
      ctx.drawImage(frame2 as CanvasImageSource, 0, 0);
      ctx.globalAlpha = 1;
      break;
    }

    case 'morph': {
      const ctx1 = (frame1 as HTMLCanvasElement).getContext('2d');
      const ctx2 = (frame2 as HTMLCanvasElement).getContext('2d');
      if (!(ctx1 && ctx2)) {
        ctx.drawImage(frame1 as HTMLCanvasElement, 0, 0);
        break;
      }
      const data1 = ctx1.getImageData(0, 0, frame1.width, frame1.height);
      const data2 = ctx2.getImageData(0, 0, frame2.width, frame2.height);
      const resultData = ctx.createImageData(result.width, result.height);

      for (let i = 0; i < data1.data.length; i++) {
        resultData.data[i] = Math.round(data1.data[i] * (1 - t) + data2.data[i] * t);
      }

      ctx.putImageData(resultData, 0, 0);
      break;
    }

    default:
      ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
  }

  return result;
}
