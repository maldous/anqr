import type { FinderPattern } from './types';
import { qrDecoderLog } from './qr-decoder-log-3';

/**
 * Given top-left and two other patterns, determine which is top-right vs bottom-left
 * based on cross product (right-hand rule)
 *
 * In image coordinates (y increases downward):
 * - If cross product is positive, rotation from a to b (around topLeft) is counterclockwise
 *   meaning a is to the right and b is below → a is top-right, b is bottom-left
 * - If cross product is negative, rotation is clockwise
 *   meaning a is below and b is to the right → b is top-right, a is bottom-left
 */
export function orderByAngle(
  topLeft: FinderPattern,
  a: FinderPattern,
  b: FinderPattern
): [FinderPattern, FinderPattern] {
  // Cross product of vectors (topLeft→a) × (topLeft→b)
  const cross =
    (a.center.x - topLeft.center.x) * (b.center.y - topLeft.center.y) -
    (a.center.y - topLeft.center.y) * (b.center.x - topLeft.center.x);

  qrDecoderLog.trace('select: Cross product calculation', {
    topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
    a: { x: a.center.x.toFixed(1), y: a.center.y.toFixed(1) },
    b: { x: b.center.x.toFixed(1), y: b.center.y.toFixed(1) },
    cross: cross.toFixed(1),
    aIsTopRight: cross > 0,
  });

  if (cross > 0) {
    return [a, b]; // a is top-right, b is bottom-left
  } else {
    return [b, a]; // b is top-right, a is bottom-left
  }
}
