import type { FinderPattern } from './types';
import { pointDistance } from './utils';
import { qrDecoderLog } from './qr-decoder-log';
import { orderFinderPatterns } from './order-finder-patterns';
import type { ScoredTriplet } from './scored-triplet';

export function evaluateCandidateTriplet(
  p1: FinderPattern,
  p2: FinderPattern,
  p3: FinderPattern
): ScoredTriplet | null {
  const avgSize = (p1.moduleSize + p2.moduleSize + p3.moduleSize) / 3;
  const sizeVariance =
    (Math.abs(p1.moduleSize - avgSize) +
      Math.abs(p2.moduleSize - avgSize) +
      Math.abs(p3.moduleSize - avgSize)) /
    avgSize;

  if (sizeVariance > 0.3) return null;

  const ordered = orderFinderPatterns(p1, p2, p3);
  if (!ordered) return null;

  const [topLeft, topRight, bottomLeft] = ordered;

  const topDist = pointDistance(topLeft.center, topRight.center);
  const leftDist = pointDistance(topLeft.center, bottomLeft.center);
  const avgDist = (topDist + leftDist) / 2;
  const squareness = Math.abs(topDist - leftDist) / avgDist;

  const vecRight = {
    x: topRight.center.x - topLeft.center.x,
    y: topRight.center.y - topLeft.center.y,
  };
  const vecDown = {
    x: bottomLeft.center.x - topLeft.center.x,
    y: bottomLeft.center.y - topLeft.center.y,
  };
  const dotProduct = vecRight.x * vecDown.x + vecRight.y * vecDown.y;
  const magRight = Math.hypot(vecRight.x, vecRight.y);
  const magDown = Math.hypot(vecDown.x, vecDown.y);
  const cosAngle = dotProduct / (magRight * magDown);
  const angleDev = Math.abs(cosAngle);

  const minHits = Math.min(p1.count, p2.count, p3.count);
  const _totalHits = p1.count + p2.count + p3.count;
  const hitCountPenalty = Math.max(0, (8 - minHits) / 8);

  const spanInModules = avgDist / avgSize;
  const referenceSpan = 22;
  const spanBonus = (referenceSpan - spanInModules) / referenceSpan;

  const score = squareness * 5 + angleDev * 5 + sizeVariance + hitCountPenalty * 2 + spanBonus * 2;

  qrDecoderLog.trace('select: Evaluating triplet', {
    topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
    topRight: { x: topRight.center.x.toFixed(1), y: topRight.center.y.toFixed(1) },
    bottomLeft: { x: bottomLeft.center.x.toFixed(1), y: bottomLeft.center.y.toFixed(1) },
    topDist: topDist.toFixed(1),
    leftDist: leftDist.toFixed(1),
    squareness: squareness.toFixed(3),
    angleDev: angleDev.toFixed(3),
    spanInModules: spanInModules.toFixed(1),
    hitCounts: `${p1.count}/${p2.count}/${p3.count}`,
    score: score.toFixed(3),
  });

  if (squareness > 0.1) {
    qrDecoderLog.trace('select: Rejecting - not square enough', {
      squareness: squareness.toFixed(3),
    });
    return null;
  }

  if (angleDev > 0.26) {
    qrDecoderLog.trace('select: Rejecting - angle not close to 90°', {
      angleDev: angleDev.toFixed(3),
    });
    return null;
  }

  return { ordered, score, squareness, moduleSizeVariance: sizeVariance };
}
