import { qrDecoderLog } from './qr-decoder-log-4';
import { correctRSBlock } from './correct-rs-block';

/**
 * Correct each RS block and count corrections made.
 */
export function correctAllBlocks(
  blockData: number[][],
  blockEcc: number[][],
  blockConfigs: Array<{ dataCount: number; eccCount: number }>
): { correctedBlocks: number[][]; totalCorrections: number } | null {
  const correctedBlocks: number[][] = [];
  let totalCorrections = 0;

  for (let b = 0; b < blockConfigs.length; b++) {
    const blockCodeword = [...blockData[b], ...blockEcc[b]];
    const { dataCount, eccCount } = blockConfigs[b];

    qrDecoderLog.trace(`rs-decoder: Processing block ${b}`, {
      dataCount,
      eccCount,
      blockLength: blockCodeword.length,
    });

    const corrected = correctRSBlock(blockCodeword, dataCount, eccCount);

    if (corrected === null) {
      qrDecoderLog.debug(`rs-decoder: Block ${b} is uncorrectable`);
      return null;
    }

    for (let i = 0; i < corrected.length; i++) {
      if (corrected[i] !== blockData[b][i]) {
        totalCorrections++;
      }
    }

    correctedBlocks.push(corrected);
  }

  return { correctedBlocks, totalCorrections };
}
