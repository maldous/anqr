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

export function enqueueNeighbors(
  grid: boolean[][],
  moduleCount: number,
  row: number,
  col: number,
  targetValue: boolean,
  visited: Uint8Array,
  queue: number[]
): void {
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
