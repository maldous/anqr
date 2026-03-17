export function drawTimingPatterns(modules: (boolean | null)[][], moduleCount: number): void {
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    modules[6][i] ??= dark;
    modules[i][6] ??= dark;
  }
}
