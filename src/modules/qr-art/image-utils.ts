/**
 * QR-Art Image Utilities
 *
 * Utilities for mapping target images to QR module values.
 * Extracted to its own file to avoid circular imports.
 */
import { rgbToLumaLinear } from '../core';

/**
 * Map an image to target pixel values with supersampling for better accuracy
 */
export interface MapImageToTargetsOptions {
  supersampleLevel?: 1 | 2 | 3;
  cleanupSpeckles?: boolean;
  maxDarkSpeckleArea?: number;
  maxLightHoleArea?: number;
}

const EIGHT_CONNECTED_OFFSETS: ReadonlyArray<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

type BinaryComponent = {
  cells: number[];
  touchesBoundary: boolean;
};

function collectComponent(
  grid: boolean[][],
  moduleCount: number,
  startRow: number,
  startCol: number,
  targetValue: boolean,
  visited: Uint8Array
): BinaryComponent {
  const queue: number[] = [];
  const cells: number[] = [];
  let touchesBoundary = false;

  const startIdx = startRow * moduleCount + startCol;
  visited[startIdx] = 1;
  queue.push(startIdx);

  for (let head = 0; head < queue.length; head++) {
    const cellIndex = queue[head];
    cells.push(cellIndex);
    const row = Math.floor(cellIndex / moduleCount);
    const col = cellIndex % moduleCount;

    if (row === 0 || col === 0 || row === moduleCount - 1 || col === moduleCount - 1) {
      touchesBoundary = true;
    }

    for (const [dr, dc] of EIGHT_CONNECTED_OFFSETS) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow < 0 || nextCol < 0 || nextRow >= moduleCount || nextCol >= moduleCount) continue;

      const nextIdx = nextRow * moduleCount + nextCol;
      if (visited[nextIdx] === 1) continue;
      if ((grid[nextRow]?.[nextCol] ?? false) !== targetValue) continue;

      visited[nextIdx] = 1;
      queue.push(nextIdx);
    }
  }

  return { cells, touchesBoundary };
}

function removeSmallComponents(
  grid: boolean[][],
  moduleCount: number,
  targetValue: boolean,
  maxArea: number,
  skipBoundaryTouching: boolean
): void {
  const visited = new Uint8Array(moduleCount * moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const cellIdx = row * moduleCount + col;
      if (visited[cellIdx] === 1) continue;
      if ((grid[row]?.[col] ?? false) !== targetValue) continue;

      const component = collectComponent(grid, moduleCount, row, col, targetValue, visited);
      if (skipBoundaryTouching && component.touchesBoundary) continue;
      if (component.cells.length <= maxArea) {
        for (const idx of component.cells) {
          const r = Math.floor(idx / moduleCount);
          const c = idx % moduleCount;
          if (grid[r]) grid[r][c] = !targetValue;
        }
      }
    }
  }
}

function cleanupBinaryTargets(
  targets: boolean[][],
  moduleCount: number,
  maxDarkSpeckleArea: number,
  maxLightHoleArea: number
): boolean[][] {
  const cleaned = targets.map((row) => row.slice());
  if (moduleCount <= 0) return cleaned;

  if (maxDarkSpeckleArea > 0) {
    removeSmallComponents(cleaned, moduleCount, true, maxDarkSpeckleArea, false);
  }

  if (maxLightHoleArea > 0) {
    removeSmallComponents(cleaned, moduleCount, false, maxLightHoleArea, true);
  }

  return cleaned;
}

export function mapImageToTargetsSupersampled(
  image: ImageData | HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  threshold: number = 128,
  options?: MapImageToTargetsOptions
): { targets: boolean[][]; importance: number[][] } {
  const isCanvasLike = (value: unknown): value is HTMLCanvasElement | OffscreenCanvas =>
    !!value &&
    typeof (value as { getContext?: unknown }).getContext === 'function' &&
    typeof (value as { width?: unknown }).width === 'number' &&
    typeof (value as { height?: unknown }).height === 'number';

  const isImageDataLike = (
    value: unknown
  ): value is { width: number; height: number; data: Uint8ClampedArray | ArrayLike<number> } => {
    if (!value) return false;
    const candidate = value as {
      width?: unknown;
      height?: unknown;
      data?: unknown;
    };
    if (typeof candidate.width !== 'number' || typeof candidate.height !== 'number') return false;

    // Canvas implementations can expose a `data()` method. Only accept actual array-like pixel data.
    if (candidate.data == null || typeof candidate.data === 'function') return false;

    const data = candidate.data as { length?: unknown };
    if (typeof data.length !== 'number') return false;
    if (data.length < candidate.width * candidate.height * 4) return false;
    return true;
  };

  // Get image data
  let imageData: ImageData;
  if (typeof ImageData !== 'undefined' && image instanceof ImageData) {
    imageData = image;
  } else if (isCanvasLike(image)) {
    const ctx = image.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) {
      // Return empty targets if we can't get context
      return {
        targets: Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(false)),
        importance: Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(0)),
      };
    }
    imageData = ctx.getImageData(0, 0, image.width, image.height);
  } else if (isImageDataLike(image)) {
    // Accept ImageData-like objects (e.g., Node test fixtures)
    const candidate = image;
    const data = candidate.data;
    imageData = {
      data:
        data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data as ArrayLike<number>),
      width: candidate.width,
      height: candidate.height,
    } as ImageData;
  } else {
    // Return empty targets if input is neither canvas-like nor imageData-like.
    return {
      targets: Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(false)),
      importance: Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(0)),
    };
  }

  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = imageData.width / moduleCount;
  const scaleY = imageData.height / moduleCount;
  const maxX = Math.max(0, imageData.width - 1);
  const maxY = Math.max(0, imageData.height - 1);

  const supersampleLevel =
    options?.supersampleLevel === 1 ? 1 : options?.supersampleLevel === 3 ? 3 : 2;
  const cleanupSpeckles = options?.cleanupSpeckles !== false;
  const maxDarkSpeckleArea =
    typeof options?.maxDarkSpeckleArea === 'number'
      ? Math.max(0, Math.floor(options.maxDarkSpeckleArea))
      : 2;
  const maxLightHoleArea =
    typeof options?.maxLightHoleArea === 'number'
      ? Math.max(0, Math.floor(options.maxLightHoleArea))
      : 2;
  const samplePoints =
    supersampleLevel === 1
      ? [{ dx: 0.5, dy: 0.5 }]
      : supersampleLevel === 3
        ? [
            { dx: 1 / 6, dy: 1 / 6 },
            { dx: 0.5, dy: 1 / 6 },
            { dx: 5 / 6, dy: 1 / 6 },
            { dx: 1 / 6, dy: 0.5 },
            { dx: 0.5, dy: 0.5 },
            { dx: 5 / 6, dy: 0.5 },
            { dx: 1 / 6, dy: 5 / 6 },
            { dx: 0.5, dy: 5 / 6 },
            { dx: 5 / 6, dy: 5 / 6 },
          ]
        : [
            { dx: 0.25, dy: 0.25 },
            { dx: 0.75, dy: 0.25 },
            { dx: 0.25, dy: 0.75 },
            { dx: 0.75, dy: 0.75 },
          ];

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      let totalGray = 0;
      let minGray = 255;
      let maxGray = 0;
      let sobelX = 0;
      let sobelY = 0;

      // Sample multiple points within the module
      for (const { dx, dy } of samplePoints) {
        const imgX = Math.max(0, Math.min(maxX, Math.floor((col + dx) * scaleX)));
        const imgY = Math.max(0, Math.min(maxY, Math.floor((row + dy) * scaleY)));
        const idx = (imgY * imageData.width + imgX) * 4;

        const rawGray =
          rgbToLumaLinear(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]) *
          255;
        const gray = Number.isFinite(rawGray) ? rawGray : 255;
        totalGray += gray;
        minGray = Math.min(minGray, gray);
        maxGray = Math.max(maxGray, gray);

        // Accumulate Sobel-style edge proxy directly at module sampling points.
        if (supersampleLevel >= 2) {
          const nx = Math.max(0, Math.min(maxX, imgX + 1));
          const px = Math.max(0, Math.min(maxX, imgX - 1));
          const ny = Math.max(0, Math.min(maxY, imgY + 1));
          const py = Math.max(0, Math.min(maxY, imgY - 1));

          const idxPx = (imgY * imageData.width + px) * 4;
          const idxNx = (imgY * imageData.width + nx) * 4;
          const idxPy = (py * imageData.width + imgX) * 4;
          const idxNy = (ny * imageData.width + imgX) * 4;

          const lPx =
            rgbToLumaLinear(
              imageData.data[idxPx],
              imageData.data[idxPx + 1],
              imageData.data[idxPx + 2]
            ) * 255;
          const lNx =
            rgbToLumaLinear(
              imageData.data[idxNx],
              imageData.data[idxNx + 1],
              imageData.data[idxNx + 2]
            ) * 255;
          const lPy =
            rgbToLumaLinear(
              imageData.data[idxPy],
              imageData.data[idxPy + 1],
              imageData.data[idxPy + 2]
            ) * 255;
          const lNy =
            rgbToLumaLinear(
              imageData.data[idxNy],
              imageData.data[idxNy + 1],
              imageData.data[idxNy + 2]
            ) * 255;

          sobelX += lNx - lPx;
          sobelY += lNy - lPy;
        }
      }

      const avgGray = totalGray / samplePoints.length;
      const contrast = maxGray - minGray;
      const edgeMagnitude = Math.min(255, Math.hypot(sobelX, sobelY));

      // Target is dark if average gray is below threshold
      targets[row][col] = avgGray < threshold;

      // Importance based on distance from threshold and local contrast
      // High contrast areas and areas far from threshold are more important
      const distanceFromThreshold = Math.abs(avgGray - threshold) / 128;
      const contrastBoost = Math.min(1, contrast / 100);
      const edgeBoost = Math.min(1, edgeMagnitude / 220);
      importance[row][col] = Math.min(
        1,
        distanceFromThreshold * 0.72 + contrastBoost * 0.18 + edgeBoost * 0.36
      );
    }
  }

  const cleanedTargets = cleanupSpeckles
    ? cleanupBinaryTargets(targets, moduleCount, maxDarkSpeckleArea, maxLightHoleArea)
    : targets;

  return { targets: cleanedTargets, importance };
}
