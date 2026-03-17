export function buildSamplePoints(level: number): Array<{ dx: number; dy: number }> {
  if (level === 1) return [{ dx: 0.5, dy: 0.5 }];
  if (level === 3) {
    return [
      { dx: 1 / 6, dy: 1 / 6 },
      { dx: 0.5, dy: 1 / 6 },
      { dx: 5 / 6, dy: 1 / 6 },
      { dx: 1 / 6, dy: 0.5 },
      { dx: 0.5, dy: 0.5 },
      { dx: 5 / 6, dy: 0.5 },
      { dx: 1 / 6, dy: 5 / 6 },
      { dx: 0.5, dy: 5 / 6 },
      { dx: 5 / 6, dy: 5 / 6 },
    ];
  }
  return [
    { dx: 0.25, dy: 0.25 },
    { dx: 0.75, dy: 0.25 },
    { dx: 0.25, dy: 0.75 },
    { dx: 0.75, dy: 0.75 },
  ];
}
