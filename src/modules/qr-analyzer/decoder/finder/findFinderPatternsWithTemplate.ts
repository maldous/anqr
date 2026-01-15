import {FinderPattern, X, candidate, candidates, center, dark, dist, for, imageData, isDark, m, moduleSize, of, p, px, py, row, score, startX, startY, step, t, threshold, v, x, y} from '../shared';
/**
 * FALLBACK: Template-based finder pattern detection
 * Uses correlation with a simple finder pattern template to find candidates
 * This is more robust than run-length encoding for noisy/distorted images
 */
export function findFinderPatternsWithTemplate(
  imageData: ImageData,
  luma: Uint8Array,
  threshold: number
): FinderPattern[] {
  const { width, height } = imageData;
  const candidates: FinderPattern[] = [];
  

  // Try different module sizes (3 to 15 pixels per module)
  const moduleSizes = [3, 4, 5, 6, 7, 8, 10, 12, 15];
  
  for (const moduleSize of moduleSizes) {
    const patternWidth = 7 * moduleSize; // Finder pattern is 7 modules wide
    
    if (patternWidth > width / 3 || patternWidth > height / 3) continue;
    
    // Create expected 1D pattern: 1-1-3-1-1 in modules
    // For each x position, compute expected darkness based on finder pattern structure
    const template: number[] = [];
    for (let m = 0; m < 7; m++) {
      // Finder pattern row at center: XXXOOOOXXX (dark-light-dark)
      // m=0,1: dark; m=2: dark; m=3: dark; m=4: dark; m=5,6: dark
      // Actually at center row: all dark except m=1 and m=5 (light ring)
      // Wait, let me think about this more carefully:
      // Finder pattern structure at center row (row 3 of 7):
      // X.XXX.X where X=dark, .=light
      // So m=0,2,3,4,6 are dark, m=1,5 are light
      const isDark = (m === 0 || m === 2 || m === 3 || m === 4 || m === 6);
      for (let p = 0; p < moduleSize; p++) {
        template.push(isDark ? 1 : -1);
      }
    }
    
    // Scan horizontally for template matches
    const horizontalMatches: Array<{ x: number; y: number; score: number }> = [];
    const verticalMatches: Array<{ x: number; y: number; score: number }> = [];
    
    // Scan step based on module size
    const scanStep = Math.max(1, Math.floor(moduleSize / 2));
    
    // Horizontal scan
    for (let y = patternWidth / 2; y < height - patternWidth / 2; y += scanStep) {
      for (let x = patternWidth / 2; x < width - patternWidth / 2; x += scanStep) {
        // Compute correlation
        let sum = 0;
        let count = 0;
        const startX = Math.floor(x - patternWidth / 2);
        
        for (let t = 0; t < template.length && startX + t < width; t++) {
          const px = startX + t;
          const grayVal = luma[Math.floor(y) * width + px];
          const normalized = grayVal < threshold ? 1 : -1;
          sum += normalized * template[t];
          count++;
        }
        
        if (count > 0) {
          const score = sum / count;
          if (score > 0.5) { // Threshold for good match
            horizontalMatches.push({ x, y, score });
          }
        }
      }
    }
    
    // Vertical scan (same template, applied vertically)
    for (let y = patternWidth / 2; y < height - patternWidth / 2; y += scanStep) {
      for (let x = patternWidth / 2; x < width - patternWidth / 2; x += scanStep) {
        let sum = 0;
        let count = 0;
        const startY = Math.floor(y - patternWidth / 2);
        
        for (let t = 0; t < template.length && startY + t < height; t++) {
          const py = startY + t;
          const grayVal = luma[py * width + Math.floor(x)];
          const normalized = grayVal < threshold ? 1 : -1;
          sum += normalized * template[t];
          count++;
        }
        
        if (count > 0) {
          const score = sum / count;
          if (score > 0.5) {
            verticalMatches.push({ x, y, score });
          }
        }
      }
    }
    
    // Intersect horizontal and vertical matches
    for (const h of horizontalMatches) {
      for (const v of verticalMatches) {
        const dist = Math.sqrt((h.x - v.x) ** 2 + (h.y - v.y) ** 2);
        if (dist < moduleSize * 3) {
          const centerX = (h.x + v.x) / 2;
          const centerY = (h.y + v.y) / 2;
          const combinedScore = (h.score + v.score) / 2;
          
          // Check if this candidate is far enough from existing ones
          let isDuplicate = false;
          for (const existing of candidates) {
            const d = Math.sqrt((existing.centerX - centerX) ** 2 + (existing.centerY - centerY) ** 2);
            if (d < moduleSize * 5) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate && combinedScore > 0.4) {
            candidates.push({
              centerX,
              centerY,
              moduleSize,
            });
          }
        }
      }
    }
    
    // If we found 3+ candidates with this module size, stop
    if (candidates.length >= 3) break;
  }
  
  return candidates;
}

