import { collectComponent } from "./collect-component";
import { flipComponentCells } from "./flip-component-cells";
import { shouldRemoveComponent } from "./should-remove-component";

export function removeSmallComponents(
  grid: boolean[][],
  moduleCount: number,
  targetValue: boolean,
  maxArea: number,
  skipBoundaryTouching: boolean,
): void {
  const visited = new Uint8Array(moduleCount * moduleCount);
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const cellIdx = row * moduleCount + col;
      if (visited[cellIdx] === 1) continue;
      if ((grid[row]?.[col] ?? false) !== targetValue) continue;

      const component = collectComponent(grid, moduleCount, row, col, targetValue, visited);
      if (shouldRemoveComponent(component, maxArea, skipBoundaryTouching)) {
        flipComponentCells(grid, moduleCount, component.cells, targetValue);
      }
    }
  }
}
