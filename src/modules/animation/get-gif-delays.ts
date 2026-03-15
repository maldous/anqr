import { decodeGif } from '../../domain/render/animation/gif-codec';
import { log } from './log';

/**
 * Get frame delays from a GIF
 */
export async function getGifDelays(source: string | ArrayBuffer): Promise<number[]> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const { frames } = decodeGif(arrayBuffer);
  const delays = frames.map((frame) => frame.delay);

  log.debug('getGifDelays: extracted', {
    frameCount: delays.length,
    uniqueDelays: [...new Set(delays)].sort((a, b) => a - b),
    totalMs: delays.reduce((s, d) => s + d, 0),
  });

  return delays;
}
