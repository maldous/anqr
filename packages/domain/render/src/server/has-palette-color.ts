export function hasPaletteColor(
  palette: number[][],
  predicate: (r: number, g: number, b: number) => boolean,
): boolean {
  return palette.some((entry) => {
    const [r, g, b] = entry;
    return predicate(r ?? 0, g ?? 0, b ?? 0);
  });
}
