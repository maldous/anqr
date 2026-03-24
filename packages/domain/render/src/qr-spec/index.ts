/**
 * QR Specification Pure Functions (render-local copy)
 *
 * These are copies of the pure coordinate-checking functions from
 * packages/domain/qr/src/spec/. They are duplicated here to break
 * the circular dependency between render and qr packages.
 *
 * The canonical source remains packages/domain/qr/src/spec/.
 * If you change QR spec logic, update both locations.
 */

// ── Types ────────────────────────────────────────────────────

export type ECCLevel = "L" | "M" | "Q" | "H";

// ── Constants ────────────────────────────────────────────────

const ALIGNMENT_POSITIONS: number[][] = [
  [], // Version 1 - no alignment
  [6, 18], // Version 2
  [6, 22], // Version 3
  [6, 26], // Version 4
  [6, 30], // Version 5
  [6, 34], // Version 6
  [6, 22, 38], // Version 7
  [6, 24, 42], // Version 8
  [6, 26, 46], // Version 9
  [6, 28, 50], // Version 10
  [6, 30, 54], // Version 11
  [6, 32, 58], // Version 12
  [6, 34, 62], // Version 13
  [6, 26, 46, 66], // Version 14
  [6, 26, 48, 70], // Version 15
  [6, 26, 50, 74], // Version 16
  [6, 30, 54, 78], // Version 17
  [6, 30, 56, 82], // Version 18
  [6, 30, 58, 86], // Version 19
  [6, 34, 62, 90], // Version 20
  [6, 28, 50, 72, 94], // Version 21
  [6, 26, 50, 74, 98], // Version 22
  [6, 30, 54, 78, 102], // Version 23
  [6, 28, 54, 80, 106], // Version 24
  [6, 32, 58, 84, 110], // Version 25
  [6, 30, 58, 86, 114], // Version 26
  [6, 34, 62, 90, 118], // Version 27
  [6, 26, 50, 74, 98, 122], // Version 28
  [6, 30, 54, 78, 102, 126], // Version 29
  [6, 26, 52, 78, 104, 130], // Version 30
  [6, 30, 56, 82, 108, 134], // Version 31
  [6, 34, 60, 86, 112, 138], // Version 32
  [6, 30, 58, 86, 114, 142], // Version 33
  [6, 34, 62, 90, 118, 146], // Version 34
  [6, 30, 54, 78, 102, 126, 150], // Version 35
  [6, 24, 50, 76, 102, 128, 154], // Version 36
  [6, 28, 54, 80, 106, 132, 158], // Version 37
  [6, 32, 58, 84, 110, 136, 162], // Version 38
  [6, 26, 54, 82, 110, 138, 166], // Version 39
  [6, 30, 58, 86, 114, 142, 170], // Version 40
];

// ── Version utilities ────────────────────────────────────────

export function getModuleCountForVersion(version: number): number {
  return version * 4 + 17;
}

export function getVersionFromModuleCount(moduleCount: number): number {
  return (moduleCount - 17) / 4;
}

// ── Pattern detection ────────────────────────────────────────

export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  if (row < 7 && col < 7) return true;
  if (row < 7 && col >= moduleCount - 7) return true;
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}

export function isTimingPattern(row: number, col: number, moduleCount: number): boolean {
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}

export function isFormatInfo(row: number, col: number, moduleCount: number): boolean {
  if (row === 8) {
    if (col <= 5) return true;
    if (col === 7 || col === 8) return true;
    if (col >= moduleCount - 8) return true;
  }
  if (col === 8) {
    if (row <= 5) return true;
    if (row === 7 || row === 8) return true;
    if (row >= moduleCount - 7) return true;
  }
  return false;
}

export function isVersionInfo(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): boolean {
  if (version < 7) return false;
  if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
  if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;
  return false;
}

// ── Alignment patterns ───────────────────────────────────────

function alignmentOverlapsFinderRegion(
  row: number,
  col: number,
  moduleCount: number,
): boolean {
  if (isFinderPattern(row, col, moduleCount)) return true;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (isFinderPattern(row + dr, col + dc, moduleCount)) {
        return true;
      }
    }
  }
  return false;
}

export function getAlignmentPatternCenters(
  version: number,
  moduleCount: number,
): { row: number; col: number }[] {
  if (version < 2) return [];

  const positions = ALIGNMENT_POSITIONS[version - 1] || [];
  const centers: { row: number; col: number }[] = [];

  for (const row of positions) {
    for (const col of positions) {
      if (!alignmentOverlapsFinderRegion(row, col, moduleCount)) {
        centers.push({ row, col });
      }
    }
  }

  return centers;
}

export function isAlignmentPattern(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): boolean {
  if (version < 2) return false;

  const centers = getAlignmentPatternCenters(version, moduleCount);

  for (const center of centers) {
    if (Math.abs(row - center.row) <= 2 && Math.abs(col - center.col) <= 2) {
      return true;
    }
  }

  return false;
}
