import type { BinaryComponent } from './binary-component.type';
import { enqueueNeighbors } from './enqueue-neighbors';

export function collectComponent(
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

    enqueueNeighbors(grid, moduleCount, row, col, targetValue, visited, queue);
  }

  return { cells, touchesBoundary };
}
