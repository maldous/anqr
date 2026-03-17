import type { DataSegment } from "./encoder-api.types";

export function calculateModeDataBits(mode: DataSegment["mode"], dataLength: number): number {
  switch (mode) {
    case "numeric":
      // 10 bits per 3 digits, 7 bits for 2 remaining, 4 bits for 1 remaining
      {
        const rem = dataLength % 3;
        let remBits: number;
        if (rem === 2) remBits = 7;
        else if (rem === 1) remBits = 4;
        else remBits = 0;
        return Math.floor(dataLength / 3) * 10 + remBits;
      }
    case "alphanumeric":
      // 11 bits per 2 chars, 6 bits for 1 remaining
      return Math.floor(dataLength / 2) * 11 + (dataLength % 2 === 1 ? 6 : 0);
    case "byte":
      return dataLength * 8;
    case "kanji":
      return dataLength * 13;
  }
}
