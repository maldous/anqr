/**
 * Debug alignment pattern and timing pattern order
 *
 * The key insight: encoder places patterns in a specific order:
 * 1. Finder patterns (and separators)
 * 2. Alignment patterns
 * 3. Timing patterns
 * 4. Format/version info reservation
 * 5. Data placement
 *
 * Our regeneration must match this EXACT order
 */

import { describe, it, expect } from 'vitest';
import { qrcode } from '../../src/modules/qr-encoder';
import { getPatternPosition } from '../../src/modules/qr-encoder/utils';

// Polyfill ImageData for Node environment
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? Math.floor(data.length / 4 / width);
    }
  };
}

describe('Alignment Pattern Order Debug', () => {
  it('checks version 7 alignment positions', () => {
    const version = 7;
    const positions = getPatternPosition(version);

    console.log('\n=== Version 7 Alignment Positions ===');
    console.log('Raw positions:', positions);

    // For version 7, positions should be [6, 22, 38]
    // This means alignment pattern centers at:
    // (6, 22), (6, 38), (22, 6), (22, 22), (22, 38), (38, 6), (38, 22), (38, 38)
    // BUT: (6, 6), (6, 38), and (38, 6) overlap with finder patterns, so they're skipped

    console.log('\nAlignment pattern centers (excluding finder overlaps):');
    const moduleCount = version * 4 + 17; // = 45

    // Mark finder pattern areas (7x7 + 1 separator at each corner)
    const finderAreas = new Set<string>();
    // Top-left finder (0-7, 0-7)
    for (let r = 0; r <= 8; r++) {
      for (let c = 0; c <= 8; c++) {
        finderAreas.add(`${r},${c}`);
      }
    }
    // Top-right finder (0-7, 37-44)
    for (let r = 0; r <= 8; r++) {
      for (let c = moduleCount - 8; c < moduleCount; c++) {
        finderAreas.add(`${r},${c}`);
      }
    }
    // Bottom-left finder (37-44, 0-7)
    for (let r = moduleCount - 8; r < moduleCount; r++) {
      for (let c = 0; c <= 8; c++) {
        finderAreas.add(`${r},${c}`);
      }
    }

    // Check each potential alignment center
    const alignmentCenters: Array<{ row: number; col: number; overlapsWithFinder: boolean }> = [];
    for (const row of positions) {
      for (const col of positions) {
        const overlapsWithFinder = finderAreas.has(`${row},${col}`);
        alignmentCenters.push({ row, col, overlapsWithFinder });
        console.log(
          `  (${row}, ${col}) - ${overlapsWithFinder ? 'SKIPPED (finder overlap)' : 'PLACED'}`
        );
      }
    }

    // For version 7 with positions [6, 22, 38]:
    // (6, 6) - overlaps with top-left finder
    // (6, 22) - should be placed
    // (6, 38) - overlaps with top-right finder
    // (22, 6) - should be placed
    // (22, 22) - should be placed
    // (22, 38) - should be placed
    // (38, 6) - overlaps with bottom-left finder
    // (38, 22) - should be placed
    // (38, 38) - should be placed

    expect(positions).toEqual([6, 22, 38]);
  });

  it('compares encoder module state at alignment positions', () => {
    const version = 7;
    const data = 'https://example.com';

    const qr = qrcode(version, 'H');
    qr.addData(data);
    qr.make(0);

    const moduleCount = qr.getModuleCount();
    const _positions = getPatternPosition(version);

    console.log('\n=== Encoder Module State at Row 4-8, Col 20-24 ===');
    console.log('(This is near alignment center (6, 22))');

    for (let row = 4; row <= 8; row++) {
      let rowStr = `Row ${row}: `;
      for (let col = 20; col <= 24; col++) {
        const isDark = qr.isDark(row, col);
        rowStr += isDark ? '█' : '░';
        rowStr += ' ';
      }
      console.log(rowStr);
    }

    // The alignment pattern at (6, 22) should be:
    // Row 4: ░ █ █ █ ░  (cols 20-24)
    // Row 5: ░ █ ░ █ ░
    // Row 6: ░ █ ░ █ ░  <- center row
    // Row 7: ░ █ ░ █ ░
    // Row 8: ░ █ █ █ ░

    // Wait, that's wrong. Alignment pattern is:
    // █ █ █ █ █
    // █ ░ ░ ░ █
    // █ ░ █ ░ █  <- center
    // █ ░ ░ ░ █
    // █ █ █ █ █

    // So at center (6, 22):
    // Row 4: cols 20-24 = █ █ █ █ █
    // Row 5: cols 20-24 = █ ░ ░ ░ █
    // Row 6: cols 20-24 = █ ░ █ ░ █
    // Row 7: cols 20-24 = █ ░ ░ ░ █
    // Row 8: cols 20-24 = █ █ █ █ █

    // But wait - this is BEFORE masking is applied!
    // Let me check if the alignment pattern is being placed correctly

    // Verify module count is correct for version 7
    expect(moduleCount, 'version 7 module count').toBe(45);

    // Check the timing pattern (row 6, should alternate)
    console.log('\n=== Timing Pattern on Row 6 ===');
    let timingRow = 'Row 6: ';
    for (let col = 8; col < moduleCount - 8; col++) {
      const isDark = qr.isDark(6, col);
      timingRow += isDark ? '█' : '░';
    }
    console.log(timingRow);
    console.log('Expected: alternating, but alignment patterns override');

    // Check the timing pattern (col 6, should alternate)
    console.log('\n=== Timing Pattern on Col 6 ===');
    for (let row = 8; row < moduleCount - 8; row++) {
      const isDark = qr.isDark(row, 6);
      console.log(
        `  Row ${row}, Col 6: ${isDark ? '█' : '░'} (expected: ${row % 2 === 0 ? '█' : '░'})`
      );
    }
  });

  it('checks if timing pattern is placed AFTER alignment patterns', () => {
    // In the encoder, the order is:
    // 1. setupPositionProbePattern (finders)
    // 2. setupPositionAdjustPattern (alignment)
    // 3. setupTimingPattern
    //
    // But in OUR regeneration, we do:
    // 1. setupFinderPattern
    // 2. setupTimingPattern  <-- WRONG ORDER!
    // 3. setupAlignmentPattern

    console.log('\n=== Checking if order matters ===');
    console.log('Encoder order: Finders -> Alignment -> Timing');
    console.log('Our order: Finders -> Timing -> Alignment');
    console.log('');
    console.log('This MIGHT cause issues where timing pattern overwrites alignment centers!');

    // For alignment center at (6, 22):
    // - Row 6 has the horizontal timing pattern
    // - If timing is placed AFTER alignment, timing overwrites the center row
    // - If timing is placed BEFORE alignment, alignment overwrites timing

    // The encoder places ALIGNMENT FIRST, then TIMING
    // The timing pattern code checks `if (_modules![row][col] == null)`
    // So it won't overwrite alignment patterns

    // But wait, looking at the encoder code:
    // setupPositionProbePattern -> setupPositionAdjustPattern -> setupTimingPattern
    // The setupTimingPattern has: `if (_modules![row][col] == null)`
    // So timing won't overwrite finder or alignment patterns

    // Our code has timing BEFORE alignment, but we also have:
    // `if (modules[6][i] === null) modules[6][i] = dark;`
    // So timing won't overwrite finders

    // BUT: we place alignment AFTER timing!
    // And alignment has: `if (modules[row][col] !== null) continue;`
    // So alignment won't overwrite timing!

    // PROBLEM FOUND: The encoder places alignment BEFORE timing,
    // so alignment overwrites the timing row/col at alignment centers.
    // We place timing BEFORE alignment, but then alignment doesn't overwrite timing
    // because of the null check.

    // SOLUTION: We need to either:
    // 1. Place alignment BEFORE timing (match encoder order), OR
    // 2. Remove the null check when placing alignment centers

    // Verify the documented finding: alignment positions exist for version 7
    const positions = getPatternPosition(7);
    expect(positions, 'version 7 alignment positions should be [6, 22, 38]').toEqual([6, 22, 38]);
  });
});
