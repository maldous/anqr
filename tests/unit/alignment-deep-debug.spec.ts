/**
 * Deep debug of alignment pattern placement
 *
 * The issue: Even after fixing the order (alignment before timing),
 * we still have 21 alignment pattern mismatches.
 *
 * Hypothesis: The issue might be in HOW alignment patterns are placed,
 * not just WHEN.
 */

import { describe, it } from 'vitest';
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

describe('Deep Alignment Pattern Debug', () => {
  it('shows exact modules at alignment center (6, 22) for v7', () => {
    const version = 7;
    const data = 'https://example.com';

    const qr = qrcode(version, 'H');
    qr.addData(data);
    qr.make(0);

    console.log('\n=== Alignment Pattern at Center (6, 22) ===');
    console.log('Expected 5x5 pattern:');
    console.log('  █ █ █ █ █');
    console.log('  █ ░ ░ ░ █');
    console.log('  █ ░ █ ░ █  <- center row (row 6)');
    console.log('  █ ░ ░ ░ █');
    console.log('  █ █ █ █ █');

    console.log('\nActual encoder output (rows 4-8, cols 20-24):');
    for (let row = 4; row <= 8; row++) {
      let rowStr = `  Row ${row}: `;
      for (let col = 20; col <= 24; col++) {
        const isDark = qr.isDark(row, col);
        rowStr += isDark ? '█ ' : '░ ';
      }
      console.log(rowStr);
    }

    // Check if the encoder even placed an alignment pattern here
    // The center should be at (6, 22), which means:
    // rows 4-8, cols 20-24

    // Center module at (6, 22) should be TRUE (dark)
    const centerDark = qr.isDark(6, 22);
    console.log(`\nCenter (6, 22) is ${centerDark ? 'DARK' : 'LIGHT'} (expected: DARK)`);

    // Corner modules should all be TRUE (dark)
    const corners = [
      { row: 4, col: 20, dark: qr.isDark(4, 20) },
      { row: 4, col: 24, dark: qr.isDark(4, 24) },
      { row: 8, col: 20, dark: qr.isDark(8, 20) },
      { row: 8, col: 24, dark: qr.isDark(8, 24) },
    ];
    console.log('\nCorners (should all be DARK):');
    for (const c of corners) {
      console.log(`  (${c.row}, ${c.col}): ${c.dark ? 'DARK' : 'LIGHT'}`);
    }

    // Inner ring should be FALSE (light)
    const innerRing = [
      { row: 5, col: 21, dark: qr.isDark(5, 21) },
      { row: 5, col: 22, dark: qr.isDark(5, 22) },
      { row: 5, col: 23, dark: qr.isDark(5, 23) },
      { row: 6, col: 21, dark: qr.isDark(6, 21) },
      { row: 6, col: 23, dark: qr.isDark(6, 23) },
      { row: 7, col: 21, dark: qr.isDark(7, 21) },
      { row: 7, col: 22, dark: qr.isDark(7, 22) },
      { row: 7, col: 23, dark: qr.isDark(7, 23) },
    ];
    console.log('\nInner ring (should all be LIGHT):');
    for (const c of innerRing) {
      console.log(`  (${c.row}, ${c.col}): ${c.dark ? 'DARK' : 'LIGHT'}`);
    }
  });

  it('checks alignment center overlap with timing row', () => {
    const version = 7;
    const positions = getPatternPosition(version);

    console.log('\n=== Alignment positions for v7 ===');
    console.log('positions:', positions);

    // positions = [6, 22, 38]
    // So alignment centers are at intersections:
    // (6, 6) - overlaps with finder
    // (6, 22) - ON TIMING ROW!
    // (6, 38) - overlaps with finder
    // (22, 6) - ON TIMING COLUMN!
    // (22, 22) - normal
    // (22, 38) - normal
    // (38, 6) - overlaps with finder
    // (38, 22) - normal
    // (38, 38) - normal

    console.log('\nAlignment centers on timing row/col:');
    console.log('  (6, 22) - Center is ON horizontal timing row (row 6)');
    console.log('  (22, 6) - Center is ON vertical timing column (col 6)');

    // For alignment at (6, 22):
    // - Row 6 is the timing row
    // - The alignment pattern's row 6 modules are at cols 20, 21, 22, 23, 24
    // - Expected: █ ░ █ ░ █ (outer, inner, center, inner, outer)
    // - But col 20 is even (dark), col 22 is even (dark), col 24 is even (dark) for timing
    // - This MATCHES the alignment pattern's outer ring!
    // - col 21 is odd (light), col 23 is odd (light) for timing
    // - This MATCHES the alignment pattern's inner ring!

    // So timing and alignment patterns have the SAME values on row 6!
    // This means order shouldn't matter for row 6 specifically.

    // BUT WAIT: The alignment pattern at row 4 and row 8 should have ALL DARK modules
    // Row 4: cols 20-24 = █ █ █ █ █
    // But these are DATA modules, not timing pattern modules!

    // The issue might be that our regeneration skips alignment modules
    // that are NOT null, but the encoder DOESN'T skip them!

    console.log('\n=== Key insight ===');
    console.log('Our code: if (modules[row][col] !== null) continue;');
    console.log('Encoder code: if (_modules![row][col] != null) continue;');
    console.log('These should be equivalent...');

    // Let me check if maybe the finder pattern separator is the issue
    // The finder separator extends beyond the 7x7 finder pattern
    // Our setupFinderPattern goes from -1 to 7, which is 9x9 including separators

    console.log('\n=== Finder pattern extent ===');
    console.log('Our code loops from r=-1 to r=7, c=-1 to c=7');
    console.log('This means rows -1 to 7 = rows 0-7 (9 rows)');
    console.log('And cols -1 to 7 = cols 0-7 (9 cols)');
    console.log('Top-left finder covers: rows 0-7, cols 0-7');
    console.log('But position 6 is INSIDE the finder separator area!');

    // For alignment at (6, 22):
    // Row 6 goes from col 0-7 for the top-left finder
    // But (6, 22) is at col 22, which is outside the finder
    // So this shouldn't be an issue

    // Let me check if (6, 6) is being skipped correctly
    console.log('\n=== Checking (6, 6) alignment ===');
    console.log('Position (6, 6) should be skipped because finder pattern is already there');
    console.log('Row 6, col 6 is part of top-left finder separator');
  });

  it('compares encoder vs our alignment placement in isolation', () => {
    const version = 7;
    const moduleCount = version * 4 + 17; // 45

    // Create a fresh module array
    const modules: (boolean | null)[][] = [];
    for (let row = 0; row < moduleCount; row++) {
      modules[row] = new Array(moduleCount).fill(null);
    }

    // Place finder patterns ONLY (no timing yet)
    const setupFinderPattern = (centerRow: number, centerCol: number) => {
      for (let r = -1; r <= 7; r++) {
        if (centerRow + r < 0 || centerRow + r >= moduleCount) continue;
        for (let c = -1; c <= 7; c++) {
          if (centerCol + c < 0 || centerCol + c >= moduleCount) continue;
          if (
            (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)
          ) {
            modules[centerRow + r][centerCol + c] = true;
          } else {
            modules[centerRow + r][centerCol + c] = false;
          }
        }
      }
    };

    setupFinderPattern(0, 0);
    setupFinderPattern(moduleCount - 7, 0);
    setupFinderPattern(0, moduleCount - 7);

    // Now place alignment patterns
    const positions = getPatternPosition(version);
    for (const row of positions) {
      for (const col of positions) {
        // This is the key check - is (row, col) null?
        if (modules[row][col] !== null) {
          console.log(
            `Skipping alignment at (${row}, ${col}) - already occupied: ${modules[row][col]}`
          );
          continue;
        }

        console.log(`Placing alignment at (${row}, ${col})`);

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              modules[row + r][col + c] = true;
            } else {
              modules[row + r][col + c] = false;
            }
          }
        }
      }
    }

    // Check our alignment pattern at (6, 22)
    console.log('\nOur alignment at (6, 22) after placement:');
    for (let row = 4; row <= 8; row++) {
      let rowStr = `  Row ${row}: `;
      for (let col = 20; col <= 24; col++) {
        const val = modules[row][col];
        rowStr += val === true ? '█ ' : val === false ? '░ ' : '? ';
      }
      console.log(rowStr);
    }

    // Compare with encoder
    const qr = qrcode(version, 'H');
    qr.addData('https://example.com');
    qr.make(0);

    console.log('\nEncoder alignment at (6, 22):');
    for (let row = 4; row <= 8; row++) {
      let rowStr = `  Row ${row}: `;
      for (let col = 20; col <= 24; col++) {
        const val = qr.isDark(row, col);
        rowStr += val ? '█ ' : '░ ';
      }
      console.log(rowStr);
    }

    // Count mismatches at this alignment pattern
    let mismatches = 0;
    for (let row = 4; row <= 8; row++) {
      for (let col = 20; col <= 24; col++) {
        const ours = modules[row][col] === true;
        const encoder = qr.isDark(row, col);
        if (ours !== encoder) {
          mismatches++;
          console.log(`Mismatch at (${row}, ${col}): ours=${ours}, encoder=${encoder}`);
        }
      }
    }

    console.log(`\nTotal mismatches in (6,22) alignment area: ${mismatches}`);
  });
});
