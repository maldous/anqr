import { qrPolynomial } from "./math";
import { getErrorCorrectPolynomial } from "./utils";
import type { QRBitBuffer as QRBitBufferType } from "@/modules/qr-encoder/types";
export { interleaveCodewords } from "./interleave-codewords";

export function computeBlockECData(
  buffer: QRBitBufferType,
  rsBlock: { dataCount: number; totalCount: number },
  offset: number,
): { dcdata: number[]; ecdata: number[]; newOffset: number } {
  const dcCount = rsBlock.dataCount;
  const ecCount = rsBlock.totalCount - dcCount;

  const dcdata = Array.from<number>({ length: dcCount });
  for (let i = 0; i < dcCount; i += 1) {
    dcdata[i] = 0xff & buffer.getBuffer()[i + offset];
  }

  const rsPoly = getErrorCorrectPolynomial(ecCount);
  const rawPoly = qrPolynomial(dcdata, rsPoly.getLength() - 1);
  const modPoly = rawPoly.mod(rsPoly);
  const ecdata = Array.from<number>({ length: rsPoly.getLength() - 1 });
  for (let i = 0; i < ecdata.length; i += 1) {
    const modIndex = i + modPoly.getLength() - ecdata.length;
    ecdata[i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
  }

  return { dcdata, ecdata, newOffset: offset + dcCount };
}
