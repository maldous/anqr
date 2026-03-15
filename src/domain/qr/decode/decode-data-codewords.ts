import { decodeDataCodewordsDetailed } from './decode-data-codewords-detailed';

/**
 * Decode the data codewords into a string
 */
export function decodeDataCodewords(dataCodewords: number[], version: number): string {
  return decodeDataCodewordsDetailed(dataCodewords, version).text;
}
