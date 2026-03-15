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
