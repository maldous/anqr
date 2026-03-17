export function buildStructuralPositionSet(moduleCount: number): Set<string> {
  const structuralPositions = new Set<string>();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      structuralPositions.add(`${r},${c}`);
      structuralPositions.add(`${r},${moduleCount - 8 + c}`);
      structuralPositions.add(`${moduleCount - 8 + r},${c}`);
    }
  }
  for (let i = 0; i < moduleCount; i++) {
    structuralPositions.add(`6,${i}`);
    structuralPositions.add(`${i},6`);
  }
  for (let i = 0; i < 9; i++) {
    structuralPositions.add(`${i},8`);
    structuralPositions.add(`8,${i}`);
    structuralPositions.add(`${moduleCount - 8 + i},8`);
    structuralPositions.add(`8,${moduleCount - 8 + i}`);
  }
  return structuralPositions;
}
