import { getMaskFunction } from "../spec/masks";
import { placeOneDataModule } from "./place-one-data-module";

export function placeDataWithZigzag(
  modules: (boolean | null)[][],
  interleaved: number[],
  maskPattern: number,
  moduleCount: number,
): void {
  const maskFunc = getMaskFunction(maskPattern);
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  let col = moduleCount - 1;
  while (col > 0) {
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const placed = placeOneDataModule(
          modules,
          row,
          col - c,
          interleaved,
          byteIndex,
          bitIndex,
          maskFunc,
        );
        byteIndex = placed.byteIndex;
        bitIndex = placed.bitIndex;
      }

      row += inc;

      if (row < 0 || row >= moduleCount) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
    col -= 2;
  }
}
