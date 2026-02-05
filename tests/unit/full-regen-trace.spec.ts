/**
 * Full regeneration trace test
 * 
 * Since alignment patterns in isolation work correctly,
 * the issue must be in the full regeneration process.
 * 
 * Let's trace step by step to find where divergence occurs.
 */

import { describe, it, expect } from 'vitest';
import { qrcode } from '../../src/modules/qr-encoder';
import { qrBitBuffer } from '../../src/modules/qr-encoder/bit-buffer';
import { qr8BitByte } from '../../src/modules/qr-encoder/data-modes';
import { getRSBlocks } from '../../src/modules/qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../../src/modules/qr-encoder/types';
import {
  getErrorCorrectPolynomial,
  getLengthInBits,
  getPatternPosition,
  getBCHTypeInfo,
  getBCHTypeNumber,
} from '../../src/modules/qr-encoder/utils';
import { qrPolynomial } from '../../src/modules/qr-encoder/math';
import { getMaskFunction } from '../../src/modules/qr-spec/masks';

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

function eccToNumeric(ecc: 'L' | 'M' | 'Q' | 'H'): number {
  switch (ecc) {
    case 'L': return QRErrorCorrectionLevel.L;
    case 'M': return QRErrorCorrectionLevel.M;
    case 'Q': return QRErrorCorrectionLevel.Q;
    case 'H': return QRErrorCorrectionLevel.H;
    default: return QRErrorCorrectionLevel.M;
  }
}

describe('Full Regeneration Trace', () => {
  it('traces matrix generation step by step and compares with encoder', () => {
    const data = 'https://example.com';
    const version = 7;
    const ecc = 'H' as const;
    const mask = 0;
    const eccLevel = eccToNumeric(ecc);
    const moduleCount = version * 4 + 17;
    
    // Get encoder's final result
    const qr = qrcode(version, ecc);
    qr.addData(data);
    qr.make(mask);
    
    // ========================================
    // Step 1: Create module array
    // ========================================
    const modules: (boolean | null)[][] = [];
    for (let row = 0; row < moduleCount; row++) {
      modules[row] = new Array(moduleCount).fill(null);
    }
    
    // ========================================
    // Step 2: Draw finder patterns
    // ========================================
    const setupFinderPattern = (centerRow: number, centerCol: number) => {
      for (let r = -1; r <= 7; r++) {
        if (centerRow + r < 0 || centerRow + r >= moduleCount) continue;
        for (let c = -1; c <= 7; c++) {
          if (centerCol + c < 0 || centerCol + c >= moduleCount) continue;
          if (
            (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)
          ) {
            modules[centerRow + r][centerCol + c] = true;
          } else {
            modules[centerRow + r][centerCol + c] = false;
          }
        }
      }
    };
    
    setupFinderPattern(0, 0);
    setupFinderPattern(moduleCount - 7, 0);
    setupFinderPattern(0, moduleCount - 7);
    
    // Compare finder patterns
    let finderMismatches = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col] !== null) {
          const ours = modules[row][col] === true;
          const encoder = qr.isDark(row, col);
          if (ours !== encoder) finderMismatches++;
        }
      }
    }
    console.log(`\nAfter finder patterns: ${finderMismatches} mismatches`);
    
    // ========================================
    // Step 3: Draw alignment patterns (BEFORE timing)
    // ========================================
    const positions = getPatternPosition(version);
    for (const row of positions) {
      for (const col of positions) {
        if (modules[row][col] !== null) continue;
        
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              modules[row + r][col + c] = true;
            } else {
              modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
    
    // Compare after alignment
    let alignmentMismatches = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col] !== null) {
          const ours = modules[row][col] === true;
          const encoder = qr.isDark(row, col);
          if (ours !== encoder) alignmentMismatches++;
        }
      }
    }
    console.log(`After alignment patterns: ${alignmentMismatches} mismatches`);
    
    // ========================================
    // Step 4: Draw timing patterns (AFTER alignment)
    // ========================================
    for (let i = 8; i < moduleCount - 8; i++) {
      const dark = i % 2 === 0;
      if (modules[6][i] === null) modules[6][i] = dark;
      if (modules[i][6] === null) modules[i][6] = dark;
    }
    
    // Compare after timing
    let timingMismatches = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col] !== null) {
          const ours = modules[row][col] === true;
          const encoder = qr.isDark(row, col);
          if (ours !== encoder) timingMismatches++;
        }
      }
    }
    console.log(`After timing patterns: ${timingMismatches} mismatches`);
    
    // ========================================
    // Step 5: Draw format info
    // ========================================
    const formatData = (eccLevel << 3) | mask;
    const formatBits = getBCHTypeInfo(formatData);
    
    for (let i = 0; i < 15; i++) {
      const mod = ((formatBits >> i) & 1) === 1;
      
      if (i < 6) {
        modules[i][8] = mod;
      } else if (i < 8) {
        modules[i + 1][8] = mod;
      } else {
        modules[moduleCount - 15 + i][8] = mod;
      }
      
      if (i < 8) {
        modules[8][moduleCount - i - 1] = mod;
      } else if (i < 9) {
        modules[8][15 - i - 1 + 1] = mod;
      } else {
        modules[8][15 - i - 1] = mod;
      }
    }
    
    // Fixed dark module
    modules[moduleCount - 8][8] = true;
    
    // Compare after format info
    let formatMismatches = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col] !== null) {
          const ours = modules[row][col] === true;
          const encoder = qr.isDark(row, col);
          if (ours !== encoder) formatMismatches++;
        }
      }
    }
    console.log(`After format info: ${formatMismatches} mismatches`);
    
    // ========================================
    // Step 6: Draw version info (version >= 7)
    // ========================================
    const versionBits = getBCHTypeNumber(version);
    
    for (let i = 0; i < 18; i++) {
      const mod = ((versionBits >> i) & 1) === 1;
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
    
    // Compare after version info
    let versionMismatches = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col] !== null) {
          const ours = modules[row][col] === true;
          const encoder = qr.isDark(row, col);
          if (ours !== encoder) versionMismatches++;
        }
      }
    }
    console.log(`After version info: ${versionMismatches} mismatches`);
    
    // ========================================
    // Step 7: Prepare data for placement
    // ========================================
    const rsBlocks = getRSBlocks(version, eccLevel);
    const buffer = qrBitBuffer();
    
    const segment = qr8BitByte(data);
    buffer.put(segment.getMode(), 4);
    buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
    segment.write(buffer);
    
    let totalDataCount = 0;
    for (const block of rsBlocks) {
      totalDataCount += block.dataCount;
    }
    
    const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
    const terminatorBits = Math.min(4, remainingBits);
    if (terminatorBits > 0) {
      buffer.put(0, terminatorBits);
    }
    
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }
    
    const PAD0 = 0xec;
    const PAD1 = 0x11;
    while (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD0, 8);
      if (buffer.getLengthInBits() < totalDataCount * 8) {
        buffer.put(PAD1, 8);
      }
    }
    
    const bufferBytes = buffer.getBuffer();
    
    // Extract per-block data and compute ECC
    const dcdata: number[][] = [];
    const ecdata: number[][] = [];
    let maxDcCount = 0;
    let maxEcCount = 0;
    const blockDataCounts: number[] = [];
    const blockEccCounts: number[] = [];
    
    let offset = 0;
    for (const block of rsBlocks) {
      const dcCount = block.dataCount;
      const ecCount = block.totalCount - dcCount;
      
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      blockDataCounts.push(dcCount);
      blockEccCounts.push(ecCount);
      
      const blockData: number[] = [];
      for (let i = 0; i < dcCount; i++) {
        blockData.push(bufferBytes[offset + i] & 0xff);
      }
      dcdata.push(blockData);
      
      const rsPoly = getErrorCorrectPolynomial(ecCount);
      const rawPoly = qrPolynomial(blockData, rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      const eccBytes: number[] = [];
      for (let i = 0; i < ecCount; i++) {
        const modIndex = i + modPoly.getLength() - ecCount;
        eccBytes.push(modIndex >= 0 ? modPoly.getAt(modIndex) : 0);
      }
      ecdata.push(eccBytes);
      
      offset += dcCount;
    }
    
    // Interleave
    const interleaved: number[] = [];
    
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < dcdata.length; r++) {
        if (i < dcdata[r].length) {
          interleaved.push(dcdata[r][i]);
        }
      }
    }
    
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < ecdata.length; r++) {
        if (i < ecdata[r].length) {
          interleaved.push(ecdata[r][i]);
        }
      }
    }
    
    console.log(`\nInterleaved ${interleaved.length} bytes`);
    
    // ========================================
    // Step 8: Place data with mask
    // ========================================
    const maskFunc = getMaskFunction(mask);
    let inc = -1;
    let row = moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    
    for (let col = moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;
      
      while (true) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          
          if (modules[row][currentCol] === null) {
            let dark = false;
            
            if (byteIndex < interleaved.length) {
              dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
            }
            
            if (maskFunc(row, currentCol)) {
              dark = !dark;
            }
            
            modules[row][currentCol] = dark;
            bitIndex--;
            
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        
        row += inc;
        
        if (row < 0 || row >= moduleCount) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
    
    console.log(`Placed ${byteIndex} bytes, ${7 - bitIndex} bits`);
    
    // ========================================
    // Final comparison
    // ========================================
    let totalMismatches = 0;
    const mismatchSamples: Array<{row: number, col: number, ours: boolean, encoder: boolean}> = [];
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const ours = modules[row][col] === true;
        const encoder = qr.isDark(row, col);
        if (ours !== encoder) {
          totalMismatches++;
          if (mismatchSamples.length < 10) {
            mismatchSamples.push({ row, col, ours, encoder });
          }
        }
      }
    }
    
    console.log(`\nFinal total mismatches: ${totalMismatches}`);
    console.log('Sample mismatches:', mismatchSamples);
    
    expect(totalMismatches).toBe(0);
  });
});
