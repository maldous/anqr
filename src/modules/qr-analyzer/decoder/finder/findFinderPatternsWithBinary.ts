import {FinderPattern, H, avgModuleSize, c, candidate, candidates, center, dist, dx, dy, for, hi, merged, moduleSize, of, p, patterns, row, score, step, t, threshold, v, x, y} from '../shared';
import { findFinderPatterns } from '../finder/findFinderPatterns';
import { findOptimalFinderCenter } from '../finder/findOptimalFinderCenter';
import { mergeCandidates } from '../finder/mergeCandidates';
import { scanLineForFinderPatternsBinary } from '../finder/scanLineForFinderPatternsBinary';
/**
 * Find finder patterns using a binary image
 */
export function findFinderPatternsWithBinary(
  binary: boolean[],
  width: number,
  height: number
): FinderPattern[] {
  let horizontalCandidates: Array<{ x: number; y: number; moduleSize: number }> = [];
  let verticalCandidates: Array<{ x: number; y: number; moduleSize: number }> = [];
  
  // Scan every row and column for thorough detection
  // FIX: Cap step at 2 maximum to avoid missing small QR codes
  const step = Math.min(2, Math.max(1, Math.floor(Math.min(width, height) / 400)));
  
  debugLog(`findFinderPatternsWithBinary: image ${width}x${height}, step=${step}`);
  
  // Scan horizontal
  for (let y = 0; y < height; y += step) {
    const lineCandidates = scanLineForFinderPatternsBinary(binary, width, y, true, width);
    for (const c of lineCandidates) {
      horizontalCandidates.push({ x: c.center, y, moduleSize: c.moduleSize });
    }
  }
  
  // Scan vertical
  for (let x = 0; x < width; x += step) {
    const lineCandidates = scanLineForFinderPatternsBinary(binary, width, x, false, height);
    for (const c of lineCandidates) {
      verticalCandidates.push({ x, y: c.center, moduleSize: c.moduleSize });
    }
  }
  
  // Log raw candidate counts before merging
  const rawHCount = horizontalCandidates.length;
  const rawVCount = verticalCandidates.length;
  
  // Merge/cluster candidates to reduce duplicates
  horizontalCandidates = mergeCandidates(horizontalCandidates);
  verticalCandidates = mergeCandidates(verticalCandidates);
  
  qrLogLazy('debug', () => `findFinderPatternsWithBinary: H candidates ${rawHCount} -> ${horizontalCandidates.length} (merged), V candidates ${rawVCount} -> ${verticalCandidates.length} (merged)`);
  debugLog(`findFinderPatternsWithBinary: H candidates=${rawHCount}->${horizontalCandidates.length}, V candidates=${rawVCount}->${verticalCandidates.length}`);
  
  // Match horizontal and vertical candidates
  const patterns: FinderPattern[] = [];
  const usedH = new Set<number>();
  const usedV = new Set<number>();
  
  for (let hi = 0; hi < horizontalCandidates.length; hi++) {
    if (usedH.has(hi)) continue;
    const h = horizontalCandidates[hi];
    
    for (let vi = 0; vi < verticalCandidates.length; vi++) {
      if (usedV.has(vi)) continue;
      const v = verticalCandidates[vi];
      
      const dx = Math.abs(h.x - v.x);
      const dy = Math.abs(h.y - v.y);
      const avgModuleSize = (h.moduleSize + v.moduleSize) / 2;
      // FIX: Increase clustering threshold from *4 to *6 for distorted images
      const clusterThreshold = avgModuleSize * 6;
      
      if (dx < clusterThreshold && dy < clusterThreshold) {
        const initialCenterX = (h.x + v.x) / 2;
        const initialCenterY = (h.y + v.y) / 2;
        
        // Find the optimal center position within this cluster
        const optimal = findOptimalFinderCenter(
          binary, width, height, initialCenterX, initialCenterY, avgModuleSize
        );
        
        // Only accept if score is good enough
        if (optimal.score >= 50) {
          qrLogLazy('debug', () => `findFinderPatterns: refined center (${initialCenterX.toFixed(1)},${initialCenterY.toFixed(1)}) -> (${optimal.x.toFixed(1)},${optimal.y.toFixed(1)}) score=${optimal.score}`);
          debugLog(`findFinderPatterns: refined center (${initialCenterX.toFixed(1)},${initialCenterY.toFixed(1)}) -> (${optimal.x.toFixed(1)},${optimal.y.toFixed(1)}) score=${optimal.score}`);
          patterns.push({
            centerX: optimal.x,
            centerY: optimal.y,
            moduleSize: avgModuleSize,
          });
          usedH.add(hi);
          usedV.add(vi);
          break;
        }
      }
    }
  }
  
  // If strict verification didn't find enough, use looser matching with scoring-based refinement
  if (patterns.length < 3) {
    const usedH2 = new Set<number>();
    const usedV2 = new Set<number>();
    
    for (let hi = 0; hi < horizontalCandidates.length; hi++) {
      if (usedH2.has(hi)) continue;
      const h = horizontalCandidates[hi];
      
      for (let vi = 0; vi < verticalCandidates.length; vi++) {
        if (usedV2.has(vi)) continue;
        const v = verticalCandidates[vi];
        
        const dx = Math.abs(h.x - v.x);
        const dy = Math.abs(h.y - v.y);
        const avgModuleSize = (h.moduleSize + v.moduleSize) / 2;
        // FIX: Increase clustering threshold from *5 to *7
        const clusterThreshold = avgModuleSize * 7;
        
        if (dx < clusterThreshold && dy < clusterThreshold) {
          const initialCenterX = (h.x + v.x) / 2;
          const initialCenterY = (h.y + v.y) / 2;
          
          // Refine center using pattern scoring (same as strict path)
          const optimal = findOptimalFinderCenter(
            binary, width, height, initialCenterX, initialCenterY, avgModuleSize
          );
          
          // Require a minimum score to accept this pattern
          if (optimal.score >= 50) {
            const centerX = optimal.x;
            const centerY = optimal.y;
            
            qrLogLazy('debug', () => `findFinderPatterns (fallback): refined center (${initialCenterX.toFixed(1)},${initialCenterY.toFixed(1)}) -> (${centerX.toFixed(1)},${centerY.toFixed(1)}) score=${optimal.score}`);
            debugLog(`findFinderPatterns (fallback): refined center (${initialCenterX.toFixed(1)},${initialCenterY.toFixed(1)}) -> (${centerX.toFixed(1)},${centerY.toFixed(1)}) score=${optimal.score}`);
            
            // Check if this pattern is already found
            const isDup = patterns.some(p => {
              const dist = Math.sqrt((p.centerX - centerX) ** 2 + (p.centerY - centerY) ** 2);
              return dist < avgModuleSize * 5;
            });
            
            if (!isDup) {
              patterns.push({
                centerX,
                centerY,
                moduleSize: avgModuleSize,
              });
            }
            usedH2.add(hi);
            usedV2.add(vi);
            break;
          }
        }
      }
    }
  }
  
  // Deduplicate patterns that are too close
  const unique: FinderPattern[] = [];
  for (const p of patterns) {
    let isDup = false;
    for (const e of unique) {
      const dist = Math.sqrt((p.centerX - e.centerX) ** 2 + (p.centerY - e.centerY) ** 2);
      if (dist < p.moduleSize * 5) {
        isDup = true;
        break;
      }
    }
    if (!isDup) unique.push(p);
  }
  
  debugLog(`findFinderPatternsWithBinary: returning ${unique.length} unique patterns`);
  for (const p of unique) {
    debugLog(`  Pattern: (${p.centerX.toFixed(1)}, ${p.centerY.toFixed(1)}) moduleSize=${p.moduleSize.toFixed(2)}`);
  }
  
  return unique;
}

