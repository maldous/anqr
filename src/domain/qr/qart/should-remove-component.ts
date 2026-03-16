export function shouldRemoveComponent(
  component: { cells: number[]; touchesBoundary: boolean },
  maxArea: number,
  skipBoundaryTouching: boolean,
): boolean {
  if (skipBoundaryTouching && component.touchesBoundary) return false;
  return component.cells.length <= maxArea;
}
