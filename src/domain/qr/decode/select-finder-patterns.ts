import type { FinderPattern } from '../../../modules/qr-decoder/types';
import { evaluateCandidateTriplet } from './evaluate-candidate-triplet';
import { qrDecoderLog } from './qr-decoder-log';
import type { ScoredTriplet } from './scored-triplet';

/**
 * Select the 3 finder patterns that form the QR code corners
 * Returns [topLeft, topRight, bottomLeft] or null if not found
 */
export function selectFinderPatterns(
  patterns: FinderPattern[]
): [FinderPattern, FinderPattern, FinderPattern] | null {
  if (patterns.length < 3) {
    qrDecoderLog.debug('select: Not enough patterns found', { count: patterns.length });
    return null;
  }

  const candidates: ScoredTriplet[] = [];

  // Try combinations of 3 patterns and score them
  for (let i = 0; i < Math.min(patterns.length, 10); i++) {
    for (let j = i + 1; j < Math.min(patterns.length, 10); j++) {
      for (let k = j + 1; k < Math.min(patterns.length, 10); k++) {
        const triplet = evaluateCandidateTriplet(patterns[i], patterns[j], patterns[k]);
        if (triplet) candidates.push(triplet);
      }
    }
  }

  if (candidates.length === 0) {
    qrDecoderLog.debug('select: Could not find valid pattern triplet');
    return null;
  }

  // Sort by score and pick the best
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  qrDecoderLog.trace('select: Selected finder patterns', {
    topLeft: { x: best.ordered[0].center.x.toFixed(1), y: best.ordered[0].center.y.toFixed(1) },
    topRight: { x: best.ordered[1].center.x.toFixed(1), y: best.ordered[1].center.y.toFixed(1) },
    bottomLeft: { x: best.ordered[2].center.x.toFixed(1), y: best.ordered[2].center.y.toFixed(1) },
    score: best.score.toFixed(3),
    squareness: best.squareness.toFixed(3),
    candidatesEvaluated: candidates.length,
  });

  return best.ordered;
}
