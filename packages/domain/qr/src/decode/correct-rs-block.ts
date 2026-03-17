import { GenericGF } from "./generic-gf";
import { qrDecoderLog } from "./qr-decoder-log";
import { ReedSolomonDecoder } from "./reed-solomon-decoder";

const qrRsDecoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);

/**
 * Correct errors in a single RS block and return the corrected data region.
 */
export function correctRSBlock(
  codeword: number[],
  dataCount: number,
  eccCount: number,
): number[] | null {
  if (codeword.length !== dataCount + eccCount) {
    qrDecoderLog.debug("rs-decoder: Codeword length mismatch", {
      n: codeword.length,
      expected: dataCount + eccCount,
    });
    return null;
  }

  const received = Int32Array.from(codeword);

  try {
    qrRsDecoder.decode(received, eccCount);
    return Array.from(received.slice(0, dataCount));
  } catch (error) {
    qrDecoderLog.debug("rs-decoder: Reed-Solomon correction failed", {
      dataCount,
      eccCount,
      error,
    });
    return null;
  }
}
