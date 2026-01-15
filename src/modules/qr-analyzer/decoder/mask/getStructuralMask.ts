import {STRUCTURAL_MASK_CACHE, bottom, c, c0, for, i, left, n, patterns, px, py, r0, right, top} from '../shared';
import { getAlignmentPatternPositions } from '../alignment/getAlignmentPatternPositions';
import { isStructuralModule } from '../mask/isStructuralModule';

export function getStructuralMask(version: number, moduleCount: number): Uint8Array {
  const key = (version << 8) | (moduleCount & 0xff);
  const cached = STRUCTURAL_MASK_CACHE.get(key);
  if (cached) return cached;

  const mask = new Uint8Array(moduleCount * moduleCount);

  // Finder patterns + separators (as per isStructuralModule() legacy rules)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      mask[r * moduleCount + c] = 1; // top-left
      mask[r * moduleCount + (moduleCount - 8 + c)] = 1; // top-right
      mask[(moduleCount - 8 + r) * moduleCount + c] = 1; // bottom-left
    }
  }

  // Timing patterns
  for (let i = 0; i < moduleCount; i++) {
    mask[6 * moduleCount + i] = 1;
    mask[i * moduleCount + 6] = 1;
  }

  // Format information
  for (let c = 0; c < 9; c++) mask[8 * moduleCount + c] = 1;
  for (let r = 0; r < 9; r++) mask[r * moduleCount + 8] = 1;
  for (let c = moduleCount - 8; c < moduleCount; c++) mask[8 * moduleCount + c] = 1;
  for (let r = moduleCount - 8; r < moduleCount; r++) mask[r * moduleCount + 8] = 1;

  // Dark module
  const dmRow = 4 * version + 9;
  if (dmRow >= 0 && dmRow < moduleCount) mask[dmRow * moduleCount + 8] = 1;

  // Version information (>= 7)
  if (version >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = moduleCount - 11; c < moduleCount - 8; c++) {
        if (c >= 0 && c < moduleCount) mask[r * moduleCount + c] = 1;
      }
    }
    for (let r = moduleCount - 11; r < moduleCount - 8; r++) {
      if (r < 0 || r >= moduleCount) continue;
      for (let c = 0; c < 6; c++) mask[r * moduleCount + c] = 1;
    }
  }

  // Alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = getAlignmentPatternPositions(version);
    const n = positions.length;
    for (let yi = 0; yi < n; yi++) {
      const py = positions[yi];
      for (let xi = 0; xi < n; xi++) {
        const px = positions[xi];

        // Skip alignment patterns that overlap with finder patterns (legacy rules)
        if (px < 8 && py < 8) continue;
        if (px < 8 && py > moduleCount - 9) continue;
        if (px > moduleCount - 9 && py < 8) continue;

        // Mark a 5x5 square around (px,py)
        const r0 = Math.max(0, py - 2), r1 = Math.min(moduleCount - 1, py + 2);
        const c0 = Math.max(0, px - 2), c1 = Math.min(moduleCount - 1, px + 2);
        for (let r = r0; r <= r1; r++) {
          let base = r * moduleCount;
          for (let c = c0; c <= c1; c++) mask[base + c] = 1;
        }
      }
    }
  }

  STRUCTURAL_MASK_CACHE.set(key, mask);
  return mask;
}

