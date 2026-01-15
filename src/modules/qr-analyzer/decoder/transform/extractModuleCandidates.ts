import {MatrixCandidate, QRLocation, X, agree, align, b, best, bestScore, bottom, c, candidate, candidates, diagonal, dx, dy, fmt, for, i, imageData, location, matrix, of, patterns, px, right, s, score, sorted, t, threshold, top, transform, valid, x, y} from '../shared';
import { buildLumaBuffer } from '../luma/buildLumaBuffer';
import { buildMatrixFromTransform } from '../transform/buildMatrixFromTransform';
import { calculateAlignmentCorrection } from '../alignment/calculateAlignmentCorrection';
import { calculatePerspectiveTransform } from '../transform/calculatePerspectiveTransform';
import { calculateRegionOtsuThreshold } from '../luma/calculateRegionOtsuThreshold';
import { createOffsetTransform } from '../transform/createOffsetTransform';
import { detectAlignmentPatterns } from '../alignment/detectAlignmentPatterns';
import { estimateModuleSizePx } from '../location/estimateModuleSizePx';
import { estimateThresholdFromFinderPatterns } from '../finder/estimateThresholdFromFinderPatterns';
import { invertMatrix } from '../transform/invertMatrix';
import { refineTransformByFormatInfo } from '../transform/refineTransformByFormatInfo';
import { scoreMatrixCandidate } from '../transform/scoreMatrixCandidate';
import { scoreTransformByFormatInfo } from '../transform/scoreTransformByFormatInfo';
import { tryRefineTransformWithAlignment } from '../alignment/tryRefineTransformWithAlignment';
/**
 * Extract module matrix candidates from the image
 * Returns an array of candidates sorted by score (best first)
 * 
 * This replaces the old "return first valid" approach with a comprehensive
 * candidate search that tries multiple thresholds and grid offsets.
 */
export function extractModuleCandidates(
  imageData: ImageData,
  location: QRLocation,
  moduleCount: number
): MatrixCandidate[] {
  const { width, height, data } = imageData;
  const luma = buildLumaBuffer(imageData);
  const s = ACTIVE_STATS;

  qrLogLazy('debug', () => `extractModuleCandidates: START moduleCount=${moduleCount}, image=${width}x${height}`);
  debugLog(`extractModuleCandidates: START moduleCount=${moduleCount}`);
  
  // Calculate base perspective transform
  let baseTransform = calculatePerspectiveTransform(location, moduleCount);
  if (!baseTransform) {
    qrLogLazy('debug', () => `extractModuleCandidates: FAILED - could not create transform`);
    debugLog(`extractModuleCandidates: FAILED - could not create transform`);
    return [];
  }

  // Calculate version once (moduleCount must be 21 + 4*(version-1))
  const version = (moduleCount - 17) / 4;

  // For version 2+, try to refine the transform using an image-space alignment search.
  // This avoids relying on a synthetic bottom-right point which can be wrong under perspective.
  if (version >= 2) {
    const moduleSizePx = estimateModuleSizePx(location, moduleCount);
    if (moduleSizePx > 0) {
      const refined = tryRefineTransformWithAlignment(imageData, location, moduleCount, version, baseTransform, moduleSizePx);
      if (refined) {
        baseTransform = refined;
      }
    }
  }

  
  // Test the transform at key points
  const testPt00 = baseTransform(0, 0);
  const testPt33 = baseTransform(3, 3);
  const testPtEnd = baseTransform(moduleCount - 1, moduleCount - 1);
  qrLogLazy('debug', () => `extractModuleCandidates: transform test - (0,0)->(${testPt00.x.toFixed(1)},${testPt00.y.toFixed(1)}), (3,3)->(${testPt33.x.toFixed(1)},${testPt33.y.toFixed(1)}), (${moduleCount-1},${moduleCount-1})->(${testPtEnd.x.toFixed(1)},${testPtEnd.y.toFixed(1)})`);
  
  // Calculate optimal threshold for this QR region
  const otsuThresh = calculateRegionOtsuThreshold(imageData, location, baseTransform, moduleCount, luma);
  qrLogLazy('debug', () => `extractModuleCandidates: region Otsu threshold=${otsuThresh}`);
  debugLog(`extractModuleCandidates: region Otsu threshold=${otsuThresh}`);
  
  // Thresholds to try
  let thresholdsToTry = [
    otsuThresh,
    128,
    Math.round(otsuThresh * 0.85),
    Math.round(otsuThresh * 1.15),
    Math.round(otsuThresh * 0.7),
    Math.round(otsuThresh * 1.3),
].filter(t => t >= 20 && t <= 235);

  const calibratedThresh = estimateThresholdFromFinderPatterns(imageData, baseTransform, moduleCount);
  if (calibratedThresh !== null) {
    qrLogLazy('debug', () => `extractModuleCandidates: calibrated threshold from finders=${calibratedThresh}`);
    debugLog(`extractModuleCandidates: calibrated threshold from finders=${calibratedThresh}`);
    thresholdsToTry = thresholdsToTry.concat([
      calibratedThresh,
      Math.round(calibratedThresh * 0.9),
      Math.round(calibratedThresh * 1.1),
    ]).filter(t => t >= 20 && t <= 235);
  }

  const uniqueThresholds = [...new Set(thresholdsToTry)];
  
  // Grid offsets to try (in modules)
  // These compensate for finder pattern detection imprecision
  // Expanded range to catch more severely misaligned QR codes
  const gridOffsets = [
    // Center (no offset)
    { dx: 0, dy: 0 },
    
    // Fine offsets (±0.1, ±0.15) for precision tuning
    { dx: 0, dy: 0.1 },
    { dx: 0, dy: -0.1 },
    { dx: 0.1, dy: 0 },
    { dx: -0.1, dy: 0 },
    { dx: 0.15, dy: 0.15 },
    { dx: -0.15, dy: -0.15 },
    { dx: 0.15, dy: -0.15 },
    { dx: -0.15, dy: 0.15 },
    
    // Small offsets (±0.25)
    { dx: 0, dy: 0.25 },
    { dx: 0, dy: -0.25 },
    { dx: 0.25, dy: 0 },
    { dx: -0.25, dy: 0 },
    { dx: 0.25, dy: 0.25 },
    { dx: -0.25, dy: -0.25 },
    { dx: 0.25, dy: -0.25 },
    { dx: -0.25, dy: 0.25 },
    
    // Medium offsets (±0.5)
    { dx: 0, dy: 0.5 },
    { dx: 0, dy: -0.5 },
    { dx: 0.5, dy: 0 },
    { dx: -0.5, dy: 0 },
    { dx: 0.5, dy: 0.5 },
    { dx: -0.5, dy: -0.5 },
    { dx: 0.5, dy: -0.5 },
    { dx: -0.5, dy: 0.5 },
    
    // Larger offsets (±0.75) for more significant misalignment
    { dx: 0, dy: 0.75 },
    { dx: 0, dy: -0.75 },
    { dx: 0.75, dy: 0 },
    { dx: -0.75, dy: 0 },
    { dx: 0.75, dy: 0.75 },
    { dx: -0.75, dy: -0.75 },
    { dx: 0.75, dy: -0.75 },
    { dx: -0.75, dy: 0.75 },
    
    // Maximum offsets (±1.0) for severely misaligned QR codes
    { dx: 0, dy: 1.0 },
    { dx: 0, dy: -1.0 },
    { dx: 1.0, dy: 0 },
    { dx: -1.0, dy: 0 },
    { dx: 1.0, dy: 1.0 },
    { dx: -1.0, dy: -1.0 },
    { dx: 1.0, dy: -1.0 },
    { dx: -1.0, dy: 1.0 },
    
    // Mixed diagonal combinations
    { dx: 0.5, dy: 0.25 },
    { dx: 0.25, dy: 0.5 },
    { dx: -0.5, dy: 0.25 },
    { dx: -0.25, dy: 0.5 },
    { dx: 0.5, dy: -0.25 },
    { dx: 0.25, dy: -0.5 },
    { dx: -0.5, dy: -0.25 },
    { dx: -0.25, dy: -0.5 },
  ];
  
  const candidates: MatrixCandidate[] = [];
  
  qrLogLazy('debug', () => `extractModuleCandidates: trying ${uniqueThresholds.length} thresholds x ${gridOffsets.length} offsets x 2 polarities = ${uniqueThresholds.length * gridOffsets.length * 2} combinations`);
  qrLogLazy('debug', () => `extractModuleCandidates: thresholds=[${uniqueThresholds.join(',')}]`);
  debugLog(`extractModuleCandidates: trying ${uniqueThresholds.length} thresholds x ${gridOffsets.length} offsets x 2 polarities = ${uniqueThresholds.length * gridOffsets.length * 2} combinations`);
  
  for (const offset of gridOffsets) {
    const transform = createOffsetTransform(baseTransform, offset.dx, offset.dy);
    
    for (const threshold of uniqueThresholds) {
      // Build normal polarity matrix
      const matrix = buildMatrixFromTransform(data, luma, width, height, transform, moduleCount, threshold);
      const score = scoreMatrixCandidate(matrix, moduleCount);
      s?.observe('candidates.score', score);
      s?.topkOffer('candidates.top', score, () => ({ threshold, dx: offset.dx, dy: offset.dy, inverted: false }));
      
      candidates.push({
        matrix,
        score,
        threshold,
        dx: offset.dx,
        dy: offset.dy,
        inverted: false,
      });
      
      // Build inverted polarity matrix
      const invertedMatrix = invertMatrix(matrix);
      const invertedScore = scoreMatrixCandidate(invertedMatrix, moduleCount);
      s?.observe('candidates.score', invertedScore);
      s?.topkOffer('candidates.top', invertedScore, () => ({ threshold, dx: offset.dx, dy: offset.dy, inverted: true }));
      
      candidates.push({
        matrix: invertedMatrix,
        score: invertedScore,
        threshold,
        dx: offset.dx,
        dy: offset.dy,
        inverted: true,
      });
    }
  }
  
  // Sort by score descending (best first)
  candidates.sort((a, b) => b.score - a.score);
  
  s?.gauge('candidates.count', candidates.length);
  if (candidates.length > 0) s?.gauge('candidates.bestScore', candidates[0].score);
  qrLogLazy('debug', () => `extractModuleCandidates: generated ${candidates.length} initial candidates`);
  debugLog(`extractModuleCandidates: generated ${candidates.length} initial candidates`);
  // For version 2+, try to refine top candidates using alignment pattern detection
  // This creates additional refined candidates that may decode better
  if (version >= 2) {
    const refinedCandidates: MatrixCandidate[] = [];
    const topCandidatesToRefine = Math.min(10, candidates.length); // Refine top 10
    
    for (let i = 0; i < topCandidatesToRefine; i++) {
      const candidate = candidates[i];
      
      // Detect alignment patterns in this candidate
      const alignments = detectAlignmentPatterns(candidate.matrix, version);
      
      if (alignments.length > 0) {
        // Calculate correction offset based on alignment pattern positions
        const correction = calculateAlignmentCorrection(alignments);
        
        if (correction) {
          qrLogLazy('debug', () => `extractModuleCandidates: candidate #${i+1} has ${alignments.length} alignments, correction=(${correction.dx.toFixed(3)}, ${correction.dy.toFixed(3)})`);
          debugLog(`extractModuleCandidates: candidate #${i+1} alignments=${alignments.length}, correction=(${correction.dx.toFixed(3)},${correction.dy.toFixed(3)})`);
          
          // Create a refined transform with the correction applied
          // The correction is SUBTRACTED because if alignment is found at offset +X,
          // we need to shift our sampling by -X to align properly
          const refinedDx = candidate.dx - correction.dx;
          const refinedDy = candidate.dy - correction.dy;
          
          const refinedTransform = createOffsetTransform(baseTransform, refinedDx, refinedDy);
          
          // Build refined matrix with same threshold
          const refinedMatrix = buildMatrixFromTransform(
            data, luma, width, height, refinedTransform, moduleCount, candidate.threshold
          );
          
          // Handle inversion if original was inverted
          const finalMatrix = candidate.inverted ? invertMatrix(refinedMatrix) : refinedMatrix;
          const refinedScore = scoreMatrixCandidate(finalMatrix, moduleCount);
          
          // Only add if the refined version has a better or equal score
          if (refinedScore >= candidate.score) {
            refinedCandidates.push({
              matrix: finalMatrix,
              score: refinedScore,
              threshold: candidate.threshold,
              dx: refinedDx,
              dy: refinedDy,
              inverted: candidate.inverted,
            });
            qrLogLazy('debug', () => `extractModuleCandidates: added refined candidate, score ${refinedScore.toFixed(2)} (was ${candidate.score.toFixed(2)})`);
          }
        }
      }
    }
    
    // Add refined candidates to the list
    if (refinedCandidates.length > 0) {
      qrLogLazy('debug', () => `extractModuleCandidates: added ${refinedCandidates.length} alignment-refined candidates`);
      debugLog(`extractModuleCandidates: added ${refinedCandidates.length} alignment-refined candidates`);
      candidates.push(...refinedCandidates);
      
      // Re-sort after adding refined candidates
      candidates.sort((a, b) => b.score - a.score);
    }
  }
  
  
  // ------------------------------------------------------------
  // Change Set #4 (robustness): format-guided sub-module refinement
  //
  // If sampling is "almost right" (common at low px/module), the two format reads
  // tend to disagree and RS fails hard. We run a tiny local (dx,dy) search around
  // the best candidates using only the 30 format modules (cheap), then rebuild
  // the full matrix once for the best offset.
  // ------------------------------------------------------------
  const estimatedModuleSizePx2 = estimateModuleSizePx(location, moduleCount);
  const maxFormatRefineRadius =
    estimatedModuleSizePx2 > 0 && estimatedModuleSizePx2 < 5 ? 0.3 :
    (estimatedModuleSizePx2 > 0 && estimatedModuleSizePx2 < 8 ? 0.2 : 0.0);

  if (maxFormatRefineRadius > 0 && candidates.length > 0) {
    const fmtRefined: MatrixCandidate[] = [];
    const topN = Math.min(8, candidates.length);

    for (let i = 0; i < topN; i++) {
      const candidate = candidates[i];

      const candidateTransform = createOffsetTransform(baseTransform, candidate.dx, candidate.dy);
      const baseFmt = scoreTransformByFormatInfo(
        data, luma, width, height,
        candidateTransform, moduleCount, candidate.threshold, candidate.inverted
      );

      // Skip if already very good.
      if (baseFmt.best && baseFmt.agree && baseFmt.score <= 1) continue;

      const refined = refineTransformByFormatInfo(
        data, luma, width, height,
        candidateTransform, moduleCount, candidate.threshold, candidate.inverted,
        maxFormatRefineRadius
      );

      // Only keep if it improves the format signal meaningfully.
      const improved =
        refined.fmt.score < baseFmt.score ||
        (refined.fmt.agree && !baseFmt.agree);

      if (!improved) continue;

      const refinedMatrix = buildMatrixFromTransform(
        data, luma, width, height, refined.transform, moduleCount, candidate.threshold
      );
      const finalMatrix = candidate.inverted ? invertMatrix(refinedMatrix) : refinedMatrix;
      const refinedScore = scoreMatrixCandidate(finalMatrix, moduleCount);

      const rt: any = refined.transform as any;
      const refinedDx = (typeof rt._dx === "number" ? rt._dx : candidate.dx);
      const refinedDy = (typeof rt._dy === "number" ? rt._dy : candidate.dy);

      fmtRefined.push({
        matrix: finalMatrix,
        score: refinedScore,
        threshold: candidate.threshold,
        dx: refinedDx,
        dy: refinedDy,
        inverted: candidate.inverted,
      });

      qrLogLazy('debug', () => `[QR-DEBUG] extractModuleCandidates: format-refine #${i + 1}: fmtScore ${baseFmt.score} -> ${refined.fmt.score} (agree ${baseFmt.agree} -> ${refined.fmt.agree}), dxdy=(${candidate.dx.toFixed(3)},${candidate.dy.toFixed(3)}) -> (${refinedDx.toFixed(3)},${refinedDy.toFixed(3)})`);
debugLog(
        `extractModuleCandidates: format-refine #${i + 1}: fmtScore ${baseFmt.score} -> ${refined.fmt.score} (agree ${baseFmt.agree} -> ${refined.fmt.agree}), dxdy=(${candidate.dx.toFixed(3)},${candidate.dy.toFixed(3)}) -> (${refinedDx.toFixed(3)},${refinedDy.toFixed(3)})`
      );
    }

    if (fmtRefined.length > 0) {
      qrLogLazy('debug', () => `extractModuleCandidates: added ${fmtRefined.length} format-refined candidates (radius=${maxFormatRefineRadius})`);
      debugLog(`extractModuleCandidates: added ${fmtRefined.length} format-refined candidates (radius=${maxFormatRefineRadius})`);
      candidates.push(...fmtRefined);
      candidates.sort((a, b) => b.score - a.score);
    }
  }

qrLogLazy('debug', () => `extractModuleCandidates: FINAL ${candidates.length} candidates`);
  debugLog(`extractModuleCandidates: FINAL ${candidates.length} candidates`);
  if (candidates.length > 0) {
    // Log top 5 candidates
    qrLogLazy('debug', () => `extractModuleCandidates: TOP 5 candidates:`);
    for (let i = 0; i < Math.min(5, candidates.length); i++) {
      const c = candidates[i];
      qrLogLazy('debug', () => `#${i+1}: score=${c.score.toFixed(2)}, threshold=${c.threshold}, offset=(${c.dx.toFixed(3)},${c.dy.toFixed(3)}), inverted=${c.inverted}`);
    }
    debugLog(`extractModuleCandidates: best score=${candidates[0].score.toFixed(1)} (threshold=${candidates[0].threshold}, offset=(${candidates[0].dx.toFixed(3)},${candidates[0].dy.toFixed(3)}), inverted=${candidates[0].inverted})`);
  }
  
  return candidates;
}

