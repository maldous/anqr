import { buildRSBlockConfigs } from "./build-rs-block-configs";
import { correctAllBlocks } from "./correct-all-blocks";
import { deinterleaveByBlock } from "./deinterleave-by-block";
import { qrDecoderLog } from "./qr-decoder-log";

/**
 * Correct errors in all RS blocks of a QR code
 *
 * @param codewords All codewords (interleaved data + ECC)
 * @param rsBlocks RS block configuration [[numBlocks, totalCount, dataCount], ...]
 * @returns Corrected and de-interleaved data codewords, or null if any block is uncorrectable
 */
export function correctRSCodewords(
  codewords: number[],
  rsBlocks: number[][],
): { dataCodewords: number[]; correctionsMade: number } | null {
  const blockConfigs = buildRSBlockConfigs(rsBlocks);
  const numBlocks = blockConfigs.length;

  const maxDataCount = Math.max(...blockConfigs.map((b) => b.dataCount));
  const maxEccCount = Math.max(...blockConfigs.map((b) => b.eccCount));

  const dataCounts = blockConfigs.map((b) => b.dataCount);
  const eccCounts = blockConfigs.map((b) => b.eccCount);

  const { blocks: blockData, nextIdx } = deinterleaveByBlock(
    codewords,
    dataCounts,
    maxDataCount,
    0,
  );
  const { blocks: blockEcc } = deinterleaveByBlock(codewords, eccCounts, maxEccCount, nextIdx);

  qrDecoderLog.trace("rs-decoder: De-interleaved into blocks", {
    numBlocks,
    blockDataLengths: blockData.map((d) => d.length).join(","),
    blockEccLengths: blockEcc.map((e) => e.length).join(","),
  });

  const result = correctAllBlocks(blockData, blockEcc, blockConfigs);
  if (!result) return null;

  const dataCodewords = result.correctedBlocks.flat();

  qrDecoderLog.trace("rs-decoder: RS correction complete", {
    totalDataCodewords: dataCodewords.length,
    totalCorrections: result.totalCorrections,
  });

  return { dataCodewords, correctionsMade: result.totalCorrections };
}
