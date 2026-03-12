import { detectImageFormat, isAnimatedWebP } from '../../domain/render/animation/format-detection';
import { createGifCompositor } from '../../domain/render/animation/gif-compositor';
import type { AnimationFrame } from './types';
import { log, extractGifFramesViaCompositor, parseWebPAsSingleFrame, parseStaticImageAsFrame } from './parsing._internal';
import { parseWebPFrames } from './parse-web-p-frames';

/**
 * Parse any animated image (GIF or WebP) and extract frames
 */
export async function parseAnimatedImage(
  source: string | ArrayBuffer,
  disposalHandling: 'respect' | 'simplify' = 'respect'
): Promise<AnimationFrame[]> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const format = detectImageFormat(arrayBuffer);

  log.debug('parseAnimatedImage: start', {
    sourceType: typeof source === 'string' ? 'url' : 'buffer',
    bytes: arrayBuffer.byteLength,
    format,
  });

  if (format === 'gif') {
    const compositor = createGifCompositor(arrayBuffer);
    const animationFrames = extractGifFramesViaCompositor(compositor, disposalHandling);
    const totalMs = animationFrames.reduce((s, f) => s + f.delay, 0);
    const uniqueDisposals = [...new Set(animationFrames.map((f) => f.disposalType))].sort(
      (a, b) => a - b
    );
    log.debug('parseAnimatedImage: GIF parsed', {
      format,
      frameCount: animationFrames.length,
      totalDurationMs: totalMs,
      sampleDelays: animationFrames.slice(0, 3).map((f) => f.delay),
      uniqueDisposals,
      disposalHandling,
    });
    return animationFrames;
  }

  if (format === 'webp') {
    if (isAnimatedWebP(arrayBuffer)) {
      return parseWebPFrames(arrayBuffer);
    }
    return parseWebPAsSingleFrame(arrayBuffer);
  }

  return parseStaticImageAsFrame(arrayBuffer);
}
