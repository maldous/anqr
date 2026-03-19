import type { DataSegment } from "./encoder-api.types";

export function calculateModeDataBits(mode: DataSegment["mode"], dataLength: number): number {
  switch (mode) {
    case "numeric": {
      const rem = dataLength % 3;
      let remBits: number;
      if (rem === 2) remBits = 7;
      else if (rem === 1) remBits = 4;
      else remBits = 0;
      return Math.floor(dataLength / 3) * 10 + remBits;
    }
    case "alphanumeric":
      return Math.floor(dataLength / 2) * 11 + (dataLength % 2 === 1 ? 6 : 0);
    case "byte":
      return dataLength * 8;
    case "kanji":
      return dataLength * 13;
  }
}
