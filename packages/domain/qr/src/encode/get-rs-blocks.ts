import type { RSBlock } from "@/modules/qr-encoder/types";
import { createRSBlock } from "./create-rs-block";
import { getRsBlockTable } from "./get-rs-block-table";

/**
 * Get Reed-Solomon blocks for a given version and ECC level
 */
export function getRSBlocks(typeNumber: number, errorCorrectionLevel: number): RSBlock[] {
  const rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

  if (rsBlock === undefined) {
    throw new TypeError(
      `bad rs block @ typeNumber:${typeNumber}/errorCorrectionLevel:${errorCorrectionLevel}`,
    );
  }

  const length = rsBlock.length / 3;
  const list: RSBlock[] = [];

  for (let i = 0; i < length; i += 1) {
    const count = rsBlock[i * 3 + 0];
    const totalCount = rsBlock[i * 3 + 1];
    const dataCount = rsBlock[i * 3 + 2];

    for (let j = 0; j < count; j += 1) {
      list.push(createRSBlock(totalCount, dataCount));
    }
  }

  return list;
}
