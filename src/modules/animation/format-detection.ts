/**
 * Format Detection
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

/**
 * Detect if an ArrayBuffer contains an animated WebP
 */
export function isAnimatedWebP(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer);

  if (view.byteLength < 12) return false;
  const riff = String.fromCodePoint(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  if (riff !== 'RIFF') return false;

  const webp = String.fromCodePoint(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  if (webp !== 'WEBP') return false;

  let offset = 12;
  while (offset < view.byteLength - 8) {
    const chunkId = String.fromCodePoint(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );

    if (chunkId === 'ANIM') return true;
    if (chunkId === 'ANMF') return true;

    const chunkSize = view.getUint32(offset + 4, true);
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return false;
}

/**
 * Detect image format from ArrayBuffer
 */
export function detectImageFormat(buffer: ArrayBuffer): 'gif' | 'webp' | 'unknown' {
  const view = new DataView(buffer);
  if (view.byteLength < 12) return 'unknown';

  const gif = String.fromCodePoint(view.getUint8(0), view.getUint8(1), view.getUint8(2));
  if (gif === 'GIF') return 'gif';

  const riff = String.fromCodePoint(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  const webp = String.fromCodePoint(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );
  if (riff === 'RIFF' && webp === 'WEBP') return 'webp';

  return 'unknown';
}
