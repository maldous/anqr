#!/usr/bin/env node
/**
 * Extract two phase helpers from generateFullQArtCore to reduce CC-30:
 * 1. buildAndValidateBasis - RS basis build + vector safety + capacity + mutation test
 * 2. selectAndFilterVectors - pixel ranking + GJ elimination + selection + numeric filter
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/modules/qr-art/generate.ts';
const src = readFileSync(FILE, 'utf8');
const lines = src.split('\n');

// Find generateFullQArtCore function start
const coreStart = lines.findIndex((l) => l.startsWith('async function generateFullQArtCore('));
if (coreStart < 0) {
  console.error('Cannot find generateFullQArtCore');
  process.exit(1);
}

// Find the export generateFullQArt function (marks end of core)
const coreEnd = lines.findIndex(
  (l, i) => i > coreStart && l.startsWith('export async function generateFullQArt(')
);
if (coreEnd < 0) {
  console.error('Cannot find export generateFullQArt');
  process.exit(1);
}

console.log(`generateFullQArtCore: lines ${coreStart + 1} to ${coreEnd}`);

// ============================================================================
// EXTRACTION 1: buildAndValidateBasis
// From: "  onProgress?.('Building RS basis', 10);" (inclusive of comment block above)
// To: just before "  onProgress?.('Mapping bits to pixels', 20);"
// ============================================================================

// Find start: the line "  onProgress?.('Building RS basis', 10);"
const basis_block_start = lines.findIndex(
  (l, i) => i > coreStart && i < coreEnd && l.includes("onProgress?.('Building RS basis', 10)")
);

// Find end: the line "  onProgress?.('Mapping bits to pixels', 20);"
const basis_block_end = lines.findIndex(
  (l, i) =>
    i > basis_block_start && i < coreEnd && l.includes("onProgress?.('Mapping bits to pixels', 20)")
);

if (basis_block_start < 0 || basis_block_end < 0) {
  console.error('Cannot find basis block boundaries', { basis_block_start, basis_block_end });
  process.exit(1);
}

console.log(`Basis block: lines ${basis_block_start + 1} to ${basis_block_end}`);

// Extract the basis block lines (between the two onProgress calls)
const basisBlockLines = lines.slice(basis_block_start + 1, basis_block_end);

// ============================================================================
// EXTRACTION 2: selectAndFilterVectors
// From: "  onProgress?.('Ranking pixels by importance', 40);"
// To: just before "  logSelectionTiming(" ... then "  onProgress?.('Counting predicted matches', 75);"
// ============================================================================

// Find start: "  onProgress?.('Ranking pixels by importance', 40);"
const select_block_start = lines.findIndex(
  (l, i) =>
    i > coreStart && i < coreEnd && l.includes("onProgress?.('Ranking pixels by importance', 40)")
);

// Find end: "  onProgress?.('Counting predicted matches', 75);"
const select_block_end = lines.findIndex(
  (l, i) =>
    i > select_block_start &&
    i < coreEnd &&
    l.includes("onProgress?.('Counting predicted matches', 75)")
);

if (select_block_start < 0 || select_block_end < 0) {
  console.error('Cannot find select block boundaries', { select_block_start, select_block_end });
  process.exit(1);
}

console.log(`Select block: lines ${select_block_start + 1} to ${select_block_end}`);

// Extract the select block lines
const selectBlockLines = lines.slice(select_block_start + 1, select_block_end);

// ============================================================================
// Build the helper function for buildAndValidateBasis
// ============================================================================

// We need to identify what variables are used from the parent scope and what's returned.
// The basis block uses from parent: encoderLayout, actualVersion, ecc, blockDataCounts,
//   baseMatrix, moduleCount, actualMask, encodedData, data, actualSuffix,
//   blockDataArrays, blockEccArrays, blockEccCounts, originalDataLength
// It returns: allowedBitRanges, basis, actualControllableBits, actualControlPercentage
// Or it returns a FullQArtResult (fail/early)

const basisHelperDef = `
interface BasisValidationSuccess {
  earlyReturn?: FullQArtResult;
  basis: ReturnType<typeof buildFullBasis>;
  actualControllableBits: number;
  actualControlPercentage: number;
  allowedBitRanges: BitRange[];
}

function buildAndValidateBasis(
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  blockDataCounts: number[],
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockEccCounts: number[],
  baseMatrix: boolean[][],
  moduleCount: number,
  actualMask: number,
  encodedData: string,
  data: string,
  actualSuffix: string,
  originalDataLength: number
): BasisValidationSuccess {
${basisBlockLines.map((l) => (l.startsWith('  ') ? l : '  ' + l)).join('\n')}

  return {
    basis,
    actualControllableBits,
    actualControlPercentage,
    allowedBitRanges,
  };
}`;

// Now we need to transform the basis block code:
// 1. Change "return buildQArtFailResult(...)" to "return { earlyReturn: buildQArtFailResult(...), ... }"
// 2. Change "return { success: true, ..." to "return { earlyReturn: { success: true, ... }, ... }"

// Actually, let me handle this differently. The helper returns BasisValidationSuccess.
// When there's a fail/early return, we set earlyReturn. Otherwise we return the normal result.
//
// The issue is that the inline code has `return buildQArtFailResult(...)` and `return { success: true, ... }`
// We need to replace those with setting earlyReturn.

// Let me build the helper code properly by processing the extracted lines:
const basisCode = basisBlockLines.join('\n');

// Replace "    return buildQArtFailResult(" with "    return { earlyReturn: buildQArtFailResult("
// and close the object at the corresponding ");"
// This is tricky. Let me use a regex approach.

// Pattern 1: return buildQArtFailResult(...);\n -> return { earlyReturn: buildQArtFailResult(...), basis: buildFullBasis(0, 'L', []), actualControllableBits: 0, actualControlPercentage: 0, allowedBitRanges: [] };
// But the buildQArtFailResult calls span multiple lines. Let me handle this differently.

// Actually, let me use a different approach. Instead of returning a complex object with earlyReturn,
// let me make the helper return `FullQArtResult | BasisSuccess` where BasisSuccess has a
// discriminating field. The simplest approach:
// - If the helper needs to "fail fast", it returns a FullQArtResult directly
// - If it succeeds, it returns a BasisSuccess object with no `success` property conflict
//   Actually FullQArtResult has `success: boolean`. BasisSuccess won't have that field.

// Let me use a tagged union approach:
// type BasisValidationResult =
//   | { kind: 'fail'; result: FullQArtResult }
//   | { kind: 'ok'; basis: ...; actualControllableBits: number; ... }

// Actually the simplest: return `string | null` for error, and use out-params or a result object.
// Or even simpler: the helper returns `{ error?: FullQArtResult; basis?; ... }`

// Let me just go with a simple approach. The helper returns:
// { earlyReturn?: FullQArtResult; basis; actualControllableBits; actualControlPercentage; allowedBitRanges }
// When earlyReturn is set, the caller returns it. Otherwise the caller uses basis etc.
// The "basis" etc. will be set to dummy values when earlyReturn is set (won't be used).

// Let me process the extracted code to replace returns:

// Find all "return buildQArtFailResult(" and "return {" patterns that are returns from the function
// For the basis block, there are:
// 1. return buildQArtFailResult(`${vectorsInProtectedRegion.length}...`, ...)
// 2. return { success: true, matrix: baseMatrix, ... } (zero-vectors case)
// 3. return buildQArtFailResult(mutationTestResult.error ?? ..., ...)

// I need to wrap each return value with earlyReturn and add dummy fields.
// The dummy basis can be { vectors: [] }.

// Let me do simple string replacement on the extracted code:
const dummyFields = `basis: { vectors: [] } as ReturnType<typeof buildFullBasis>, actualControllableBits: 0, actualControlPercentage: 0, allowedBitRanges: []`;

// Replace "return buildQArtFailResult(" -> "return { earlyReturn: buildQArtFailResult("
// and the closing ");" -> `), ${dummyFields} };`
// This is hard because the calls span multiple lines. Let me use a different approach.

// Instead of complex regex, let me create a Node transform:
function transformBasisBlock(code) {
  const lines = code.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Case 1: "return buildQArtFailResult(" - spans multiple lines
    if (trimmed.startsWith('return buildQArtFailResult(')) {
      // Collect all lines until we find the closing ");"
      let block = line;
      let depth = 0;
      for (const ch of line) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
      }
      i++;
      while (depth > 0 && i < lines.length) {
        block += '\n' + lines[i];
        for (const ch of lines[i]) {
          if (ch === '(') depth++;
          if (ch === ')') depth--;
        }
        i++;
      }
      // Now wrap in earlyReturn
      const indent = line.match(/^(\s*)/)[1];
      // Replace "return buildQArtFailResult(" with "return { earlyReturn: buildQArtFailResult("
      block = block.replace(
        'return buildQArtFailResult(',
        'return {\n' + indent + '  earlyReturn: buildQArtFailResult('
      );
      // Replace the final ");" with "), basis, actualControllableBits, actualControlPercentage, allowedBitRanges };"
      // But basis may not be defined yet! For the first return (vector safety), basis IS defined.
      // For the mutation test return, basis IS also defined.
      // So we can use the actual variables.

      // Actually wait - for the vector safety return, basis is already defined on the line above.
      // For the zero-vector return, basis is defined too.
      // For the mutation test return, basis is defined too.
      // So we can safely reference basis, actualControllableBits, etc.

      // Replace the last ");" with the wrapped version
      const lastSemicolon = block.lastIndexOf(');');
      block =
        block.slice(0, lastSemicolon) +
        '),\n' +
        indent +
        '  basis, actualControllableBits: 0, actualControlPercentage: 0, allowedBitRanges,\n' +
        indent +
        '};';

      result.push(block);
      continue;
    }

    // Case 2: "return {" for the zero-vectors success case
    if (trimmed === 'return {' && i > 0) {
      // Check if this is inside the "if (basis.vectors.length === 0)" block
      // Collect the full return statement
      let block = line;
      let depth = 1; // We've seen the opening {
      i++;
      while (depth > 0 && i < lines.length) {
        for (const ch of lines[i]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        block += '\n' + lines[i];
        i++;
      }
      // Check if this looks like a FullQArtResult (has "success:" in it)
      if (block.includes('success:')) {
        const indent = line.match(/^(\s*)/)[1];
        // Wrap the entire return value in earlyReturn
        block = block.replace('return {', 'return {\n' + indent + '  earlyReturn: {');
        // Find the last "};" and replace with "}, basis, ... };"
        const lastClose = block.lastIndexOf('};');
        block =
          block.slice(0, lastClose) +
          '},\n' +
          indent +
          '  basis, actualControllableBits: 0, actualControlPercentage: 0, allowedBitRanges,\n' +
          indent +
          '};';
        result.push(block);
        continue;
      }
      result.push(block);
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

// Hmm this is getting really complex. Let me simplify dramatically.
//
// Instead of transforming the code, I'll just manually write the two helper functions.
// I know exactly what the code does. Let me write them directly.

// Actually, let me take yet another approach. Instead of trying to automate the transformation,
// let me just:
// 1. Add a wrapper around the inline code that captures returns
// 2. The wrapper pattern: extract the block into a function that returns the same way

// The cleanest approach is to make the helper match the inline structure exactly,
// but return a result object instead of directly returning from the parent.

// Let me just build the output directly.

// ============================================================================
// APPROACH: Direct insertion
// ============================================================================

// I'll create the two helper functions by extracting the code, then modify generateFullQArtCore
// to call them. The key insight: I'll use labeled returns via result objects.

// For buildAndValidateBasis:
// - Takes all needed params
// - Returns { earlyReturn?: FullQArtResult, basis, actualControllableBits, actualControlPercentage, allowedBitRanges }
// - When earlyReturn is set, caller returns it

// For selectAndFilterVectors:
// - Takes all needed params
// - Returns { blockSelections, flattenedSelections, totalSelected, elimination }

// Let me build the output file:

const output = [];

// Copy everything before generateFullQArtCore (including all existing helpers)
for (let i = 0; i < coreStart; i++) {
  output.push(lines[i]);
}

// ============================================================================
// Insert buildAndValidateBasis helper
// ============================================================================
output.push('');
output.push('interface BasisValidationSuccess {');
output.push('  earlyReturn?: FullQArtResult;');
output.push('  basis: ReturnType<typeof buildFullBasis>;');
output.push('  actualControllableBits: number;');
output.push('  actualControlPercentage: number;');
output.push('  allowedBitRanges: BitRange[];');
output.push('}');
output.push('');
output.push('function buildAndValidateBasis(');
output.push('  encoderLayout: EncoderDerivedLayout,');
output.push('  actualVersion: number,');
output.push('  ecc: ECCLevel,');
output.push('  blockDataCounts: number[],');
output.push('  blockDataArrays: Uint8Array[],');
output.push('  blockEccArrays: Uint8Array[],');
output.push('  blockEccCounts: number[],');
output.push('  baseMatrix: boolean[][],');
output.push('  moduleCount: number,');
output.push('  actualMask: number,');
output.push('  encodedData: string,');
output.push('  data: string,');
output.push('  actualSuffix: string,');
output.push('  originalDataLength: number');
output.push('): BasisValidationSuccess {');

// Now insert the extracted basis block code, transforming returns
const basisLines = basisBlockLines;
const inBasisHelper = true;

for (let i = 0; i < basisLines.length; i++) {
  const line = basisLines[i];
  const trimmed = line.trim();

  // Replace direct returns with earlyReturn wrapper
  if (trimmed.startsWith('return buildQArtFailResult(')) {
    // Collect the full multi-line return statement
    const block = [line];
    let depth = 0;
    for (const ch of line) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
    let j = i + 1;
    while (depth > 0 && j < basisLines.length) {
      block.push(basisLines[j]);
      for (const ch of basisLines[j]) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
      }
      j++;
    }
    const indent = line.match(/^(\s*)/)[1];
    // Output wrapped version
    output.push(indent + 'const _failResult = buildQArtFailResult(');
    // Extract the args from the block (skip "return buildQArtFailResult(" and the final ");")
    const fullBlock = block.join('\n');
    const argsMatch = fullBlock.match(/return buildQArtFailResult\(([\s\S]*)\);/);
    if (argsMatch) {
      output.push(argsMatch[1]);
    }
    output.push(indent + ');');
    output.push(
      indent +
        'return { earlyReturn: _failResult, basis, actualControllableBits: 0, actualControlPercentage: 0, allowedBitRanges };'
    );
    i = j - 1; // Skip processed lines
    continue;
  }

  // Replace the zero-vectors return { success: true, ... }
  if (trimmed === 'return {' || trimmed.startsWith('return {')) {
    // Check if next lines contain "success:" (it's a FullQArtResult)
    let lookAhead = '';
    for (let j = i; j < Math.min(i + 15, basisLines.length); j++) {
      lookAhead += basisLines[j] + '\n';
    }
    if (lookAhead.includes('success: true') || lookAhead.includes('success: false')) {
      // Collect the full return statement
      const block = [line];
      let depth = 0;
      for (const ch of line) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      let j = i + 1;
      while (depth > 0 && j < basisLines.length) {
        block.push(basisLines[j]);
        for (const ch of basisLines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        j++;
      }
      const indent = line.match(/^(\s*)/)[1];
      // Output as earlyReturn
      output.push(indent + 'return {');
      output.push(indent + '  earlyReturn: {');
      // Extract the object contents
      const fullBlock = block.join('\n');
      const objMatch = fullBlock.match(/return \{([\s\S]*)\};/);
      if (objMatch) {
        // Indent each line one more level
        const objLines = objMatch[1].split('\n');
        for (const ol of objLines) {
          output.push('  ' + ol);
        }
      }
      output.push(indent + '  },');
      output.push(indent + '  basis,');
      output.push(indent + '  actualControllableBits: 0,');
      output.push(indent + '  actualControlPercentage: 0,');
      output.push(indent + '  allowedBitRanges,');
      output.push(indent + '};');
      i = j - 1;
      continue;
    }
  }

  output.push(line);
}

output.push('');
output.push('  return {');
output.push('    basis,');
output.push('    actualControllableBits,');
output.push('    actualControlPercentage,');
output.push('    allowedBitRanges,');
output.push('  };');
output.push('}');

// ============================================================================
// Insert selectAndFilterVectors helper
// ============================================================================

output.push('');
output.push('interface VectorSelectionResult {');
output.push('  blockSelections: BlockSelectionResult[];');
output.push('  flattenedSelections: FlattenedSelection[];');
output.push('  totalSelected: number;');
output.push('  elimination: EliminationResult;');
output.push('}');
output.push('');
output.push('function selectAndFilterVectors(');
output.push('  basis: ReturnType<typeof buildFullBasis>,');
output.push('  mappings: ReturnType<typeof buildBitPixelMap>,');
output.push('  targets: boolean[][],');
output.push('  importance: number[][],');
output.push('  baseMatrix: boolean[][],');
output.push('  moduleCount: number,');
output.push('  dataPixelIndices: number[],');
output.push('  dataPixels: Set<number>,');
output.push('  performanceSettings: QArtPerformanceSettings,');
output.push('  performanceProfile: QArtPerformanceProfile,');
output.push("  resolvedSuffixMode: 'numeric' | 'byte',");
output.push('  strictSuffix: boolean,');
output.push('  blockDataArrays: Uint8Array[],');
output.push('  blockDataCounts: number[],');
output.push('  encoderLayout: EncoderDerivedLayout,');
output.push('  actualVersion: number,');
output.push('  actualMask: number');
output.push('): VectorSelectionResult {');

// Insert the select block code
for (const line of selectBlockLines) {
  output.push(line);
}

// Add the logSelectionTiming call and return
output.push('');
output.push(
  '  logSelectionTiming(timingEnabled, timingMarks, preReduceTargetCount, totalSelected);'
);
output.push('');
output.push('  return { blockSelections, flattenedSelections, totalSelected, elimination };');
output.push('}');
output.push('');

// ============================================================================
// Now output generateFullQArtCore with the inline code replaced by helper calls
// ============================================================================

// Copy the function from coreStart to basis_block_start (inclusive of the onProgress call)
for (let i = coreStart; i <= basis_block_start; i++) {
  output.push(lines[i]);
}

// Insert call to buildAndValidateBasis
output.push('');
output.push('  const basisResult = buildAndValidateBasis(');
output.push('    encoderLayout, actualVersion, ecc, blockDataCounts,');
output.push('    blockDataArrays, blockEccArrays, blockEccCounts,');
output.push('    baseMatrix, moduleCount, actualMask,');
output.push('    encodedData, data, actualSuffix, originalDataLength');
output.push('  );');
output.push('  if (basisResult.earlyReturn) {');
output.push('    return basisResult.earlyReturn;');
output.push('  }');
output.push(
  '  const { basis, actualControllableBits, actualControlPercentage, allowedBitRanges } = basisResult;'
);
output.push('');

// Copy from basis_block_end (the "Mapping bits to pixels" onProgress) to select_block_start (the "Ranking pixels" onProgress)
for (let i = basis_block_end; i <= select_block_start; i++) {
  output.push(lines[i]);
}

// Insert call to selectAndFilterVectors
output.push('');
output.push('  const selectionResult = selectAndFilterVectors(');
output.push('    basis, mappings, targets, importance, baseMatrix, moduleCount,');
output.push('    dataPixelIndices, dataPixels, performanceSettings, performanceProfile,');
output.push('    resolvedSuffixMode, strictSuffix, blockDataArrays, blockDataCounts,');
output.push('    encoderLayout, actualVersion, actualMask');
output.push('  );');
output.push(
  '  const { blockSelections, flattenedSelections, totalSelected, elimination } = selectionResult;'
);
output.push('  const _orderedSelections = flattenedSelections;');
output.push('');

// Skip the inline select block and the logSelectionTiming call,
// resume from "  onProgress?.('Counting predicted matches', 75);"
for (let i = select_block_end; i < coreEnd; i++) {
  output.push(lines[i]);
}

// Copy everything from coreEnd to end of file
for (let i = coreEnd; i < lines.length; i++) {
  output.push(lines[i]);
}

writeFileSync(FILE, output.join('\n'));
console.log('Done! Wrote transformed file.');
console.log(`  buildAndValidateBasis: ${basisBlockLines.length} lines extracted`);
console.log(`  selectAndFilterVectors: ${selectBlockLines.length} lines extracted`);
