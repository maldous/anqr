/**
 * Interleaving Debug Test
 * 
 * This test directly compares our interleaving logic with the encoder's
 * to identify the exact source of the mismatch.
 */

import { describe, it, expect } from 'vitest';
import { qrBitBuffer } from '../../src/modules/qr-encoder/bit-buffer';
import { qr8BitByte } from '../../src/modules/qr-encoder/data-modes';
import { getRSBlocks } from '../../src/modules/qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../../src/modules/qr-encoder/types';
import {
  getErrorCorrectPolynomial,
  getLengthInBits,
} from '../../src/modules/qr-encoder/utils';
import { qrPolynomial } from '../../src/modules/qr-encoder/math';

// Polyfill ImageData for Node environment
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data;
      this.width = width;
      this.height = height ?? Math.floor(data.length / 4 / width);
    }
  };
}

/**
 * Convert ECC level character to numeric value
 */
function eccToNumeric(ecc: 'L' | 'M' | 'Q' | 'H'): number {
  switch (ecc) {
    case 'L': return QRErrorCorrectionLevel.L;
    case 'M': return QRErrorCorrectionLevel.M;
    case 'Q': return QRErrorCorrectionLevel.Q;
    case 'H': return QRErrorCorrectionLevel.H;
    default: return QRErrorCorrectionLevel.M;
  }
}

/**
 * This is EXACTLY the encoder's createBytes function, copied verbatim
 */
function createBytesExactEncoder(
  data: string,
  version: number,
  eccLevel: number
): {
  dataCache: number[];
  dcdata: number[][];
  ecdata: number[][];
} {
  const rsBlocks = getRSBlocks(version, eccLevel);
  const buffer = qrBitBuffer();
  
  // Encode data
  const segment = qr8BitByte(data);
  buffer.put(segment.getMode(), 4);
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  segment.write(buffer);
  
  // Calc total data count
  let totalDataCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalDataCount += rsBlocks[i].dataCount;
  }
  
  // End code
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }
  
  // Padding to byte
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  
  // Padding bytes
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD1, 8);
  }
  
  // --- createBytes logic (EXACT copy from encoder.ts) ---
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;
  
  const dcdata: number[][] = new Array(rsBlocks.length);
  const ecdata: number[][] = new Array(rsBlocks.length);
  
  for (let r = 0; r < rsBlocks.length; r++) {
    const dcCount = rsBlocks[r].dataCount;
    const ecCount = rsBlocks[r].totalCount - dcCount;
    
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    
    dcdata[r] = new Array(dcCount);
    for (let i = 0; i < dcdata[r].length; i++) {
      dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
    }
    offset += dcCount;
    
    // Compute ECC - EXACT encoder logic
    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ecdata[r].length; i++) {
      const modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
    }
  }
  
  // Interleave - EXACT encoder logic
  let totalCodeCount = 0;
  for (let i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }
  
  const dataCache = new Array<number>(totalCodeCount);
  let index = 0;
  
  // Data interleaving
  for (let i = 0; i < maxDcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        dataCache[index] = dcdata[r][i];
        index++;
      }
    }
  }
  
  // ECC interleaving
  for (let i = 0; i < maxEcCount; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        dataCache[index] = ecdata[r][i];
        index++;
      }
    }
  }
  
  return { dataCache, dcdata, ecdata };
}

/**
 * Our implementation from generate.ts (using Uint8Array and our computeECC)
 */
function createBytesOurWay(
  data: string,
  version: number,
  eccLevel: number
): {
  dataCache: number[];
  dcdata: Uint8Array[];
  ecdata: Uint8Array[];
} {
  const rsBlocks = getRSBlocks(version, eccLevel);
  const buffer = qrBitBuffer();
  
  // Encode data
  const segment = qr8BitByte(data);
  buffer.put(segment.getMode(), 4);
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  segment.write(buffer);
  
  // Calc total data count
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }
  
  // Terminator
  const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
  const terminatorBits = Math.min(4, remainingBits);
  if (terminatorBits > 0) {
    buffer.put(0, terminatorBits);
  }
  
  // Padding to byte
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  
  // Padding bytes
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (buffer.getLengthInBits() < totalDataCount * 8) {
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD1, 8);
    }
  }
  
  const bufferBytes = buffer.getBuffer();
  
  // Extract per-block data
  const dcdata: Uint8Array[] = [];
  const ecdata: Uint8Array[] = [];
  const blockDataCounts: number[] = [];
  const blockEccCounts: number[] = [];
  
  let offset = 0;
  for (const block of rsBlocks) {
    const blockData = new Uint8Array(block.dataCount);
    for (let i = 0; i < block.dataCount; i++) {
      blockData[i] = bufferBytes[offset + i] & 0xff;
    }
    dcdata.push(blockData);
    blockDataCounts.push(block.dataCount);
    
    const eccCount = block.totalCount - block.dataCount;
    blockEccCounts.push(eccCount);
    
    // Compute ECC using encoder's exact method
    const rsPoly = getErrorCorrectPolynomial(eccCount);
    const rawPoly = qrPolynomial(Array.from(blockData), rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    const eccBytes = new Uint8Array(eccCount);
    for (let i = 0; i < eccCount; i++) {
      const modIndex = i + modPoly.getLength() - eccCount;
      eccBytes[i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
    }
    ecdata.push(eccBytes);
    
    offset += block.dataCount;
  }
  
  // Interleave - our way
  const maxDataCount = Math.max(...blockDataCounts);
  const maxEccCount = Math.max(...blockEccCounts);
  const dataCache: number[] = [];
  
  // Data interleaving
  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < dcdata.length; b++) {
      if (i < blockDataCounts[b]) {
        dataCache.push(dcdata[b][i]);
      }
    }
  }
  
  // ECC interleaving
  for (let i = 0; i < maxEccCount; i++) {
    for (let b = 0; b < ecdata.length; b++) {
      if (i < blockEccCounts[b]) {
        dataCache.push(ecdata[b][i]);
      }
    }
  }
  
  return { dataCache, dcdata, ecdata };
}

describe('Interleaving Debug', () => {
  it('compares encoder vs our interleaving for v7 ECC=H', () => {
    const data = 'https://example.com';
    const version = 7;
    const eccLevel = eccToNumeric('H');
    
    const encoder = createBytesExactEncoder(data, version, eccLevel);
    const ours = createBytesOurWay(data, version, eccLevel);
    
    console.log('\n=== Interleaving Comparison ===');
    console.log('Encoder dataCache length:', encoder.dataCache.length);
    console.log('Our dataCache length:', ours.dataCache.length);
    
    // Compare per-block data
    console.log('\n--- Per-block data comparison ---');
    for (let b = 0; b < encoder.dcdata.length; b++) {
      const encoderBlock = encoder.dcdata[b];
      const ourBlock = ours.dcdata[b];
      const match = encoderBlock.length === ourBlock.length && 
                    encoderBlock.every((v, i) => v === ourBlock[i]);
      console.log(`Block ${b} data: encoder=${encoderBlock.length} bytes, ours=${ourBlock.length} bytes, match=${match}`);
      if (!match) {
        console.log(`  Encoder: [${encoderBlock.slice(0, 5).join(', ')}...]`);
        console.log(`  Ours: [${Array.from(ourBlock.slice(0, 5)).join(', ')}...]`);
      }
    }
    
    // Compare per-block ECC
    console.log('\n--- Per-block ECC comparison ---');
    for (let b = 0; b < encoder.ecdata.length; b++) {
      const encoderEcc = encoder.ecdata[b];
      const ourEcc = ours.ecdata[b];
      const match = encoderEcc.length === ourEcc.length && 
                    encoderEcc.every((v, i) => v === ourEcc[i]);
      console.log(`Block ${b} ECC: encoder=${encoderEcc.length} bytes, ours=${ourEcc.length} bytes, match=${match}`);
      if (!match) {
        console.log(`  Encoder: [${encoderEcc.slice(0, 5).join(', ')}...]`);
        console.log(`  Ours: [${Array.from(ourEcc.slice(0, 5)).join(', ')}...]`);
      }
    }
    
    // Compare final interleaved bytes
    console.log('\n--- Final interleaved bytes comparison ---');
    let firstDiff = -1;
    for (let i = 0; i < Math.max(encoder.dataCache.length, ours.dataCache.length); i++) {
      if (encoder.dataCache[i] !== ours.dataCache[i]) {
        firstDiff = i;
        break;
      }
    }
    
    if (firstDiff === -1) {
      console.log('ALL BYTES MATCH!');
    } else {
      console.log(`First difference at index ${firstDiff}:`);
      console.log(`  Encoder[${firstDiff}] = ${encoder.dataCache[firstDiff]}`);
      console.log(`  Ours[${firstDiff}] = ${ours.dataCache[firstDiff]}`);
      
      // Show context around the difference
      const start = Math.max(0, firstDiff - 3);
      const end = Math.min(encoder.dataCache.length, firstDiff + 5);
      console.log(`  Context: encoder[${start}:${end}] = [${encoder.dataCache.slice(start, end).join(', ')}]`);
      console.log(`  Context: ours[${start}:${end}] = [${ours.dataCache.slice(start, end).join(', ')}]`);
    }
    
    // Count total differences
    let diffCount = 0;
    for (let i = 0; i < Math.max(encoder.dataCache.length, ours.dataCache.length); i++) {
      if (encoder.dataCache[i] !== ours.dataCache[i]) diffCount++;
    }
    console.log(`\nTotal byte differences: ${diffCount}`);
    
    expect(encoder.dataCache).toEqual(ours.dataCache);
  });
  
  it('tests v4 ECC=M which works correctly', () => {
    const data = 'https://example.com';
    const version = 4;
    const eccLevel = eccToNumeric('M');
    
    const encoder = createBytesExactEncoder(data, version, eccLevel);
    const ours = createBytesOurWay(data, version, eccLevel);
    
    console.log('\n=== v4 ECC=M (should work) ===');
    console.log('Encoder dataCache length:', encoder.dataCache.length);
    console.log('Our dataCache length:', ours.dataCache.length);
    
    expect(encoder.dataCache).toEqual(ours.dataCache);
  });
});
