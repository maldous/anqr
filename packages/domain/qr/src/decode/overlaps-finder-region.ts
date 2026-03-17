export function overlapsFinderRegion(cx: number, cy: number, moduleCount: number): boolean {
  return (
    (cx <= 8 && cy <= 8) || (cx >= moduleCount - 9 && cy <= 8) || (cx <= 8 && cy >= moduleCount - 9)
  );
}
