import { qrBitBuffer } from "./bit-buffer";
import { getRSBlocks } from "./rs-blocks";
import { getLengthInBits } from "./utils";
import type { QRDataSegment } from "../../../modules/qr-encoder/types";

export function autoDetectTypeNumber(
  errorCorrectionLevel: number,
  dataList: QRDataSegment[],
): number {
  for (let typeNum = 1; typeNum < 40; typeNum++) {
    const rsBlocks = getRSBlocks(typeNum, errorCorrectionLevel);
    const buffer = qrBitBuffer();
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];
      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNum));
      data.write(buffer);
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() <= totalDataCount * 8) {
      return typeNum;
    }
  }
  return 40;
}
