import { classifyScaledModule } from "./classify-scaled-module";

export function buildScaledFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const map = new Uint8Array(moduleCount * moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    const rowBase = row * moduleCount;

    for (let col = 0; col < moduleCount; col++) {
      map[rowBase + col] = classifyScaledModule(row, col, moduleCount, version);
    }
  }

  return map;
}
