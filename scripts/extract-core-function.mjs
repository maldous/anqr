/**
 * Script to extract the try body of generateFullQArt into generateFullQArtCore.
 * This reduces Sonar S3776 cognitive complexity by removing 1 nesting level
 * from all conditionals inside the try block.
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/modules/qr-art/generate.ts';
const content = readFileSync(FILE, 'utf8');
const lines = content.split('\n');

// Find the start of generateFullQArt
const funcStartIdx = lines.findIndex((l) =>
  l.startsWith('export async function generateFullQArt(config: FullQArtConfig)')
);
if (funcStartIdx === -1) throw new Error('Could not find generateFullQArt');
console.log(`Found generateFullQArt at line ${funcStartIdx + 1}`);

// Find the try { line (first one after funcStartIdx)
let tryIdx = -1;
for (let i = funcStartIdx; i < lines.length; i++) {
  if (lines[i].trim() === 'try {') {
    tryIdx = i;
    break;
  }
}
if (tryIdx === -1) throw new Error('Could not find try block');
console.log(`Found try { at line ${tryIdx + 1}`);

// Find the matching `  } catch (error) {` line
// The try block is at 2-space indentation inside generateFullQArt,
// so the catch is at the same level: exactly `  } catch (error) {`
let catchIdx = -1;
for (let i = tryIdx + 1; i < lines.length; i++) {
  if (lines[i] === '  } catch (error) {') {
    catchIdx = i;
    break;
  }
}
if (catchIdx === -1) throw new Error('Could not find catch block');
console.log(`Found } catch at line ${catchIdx + 1}`);

// Find the end of generateFullQArt
// After the catch block, the function closes with `}` at column 0
// We look for the closing `}` of the function
let funcEndIdx = -1;
for (let i = catchIdx + 1; i < lines.length; i++) {
  if (lines[i] === '}') {
    funcEndIdx = i;
    break;
  }
}
if (funcEndIdx === -1) throw new Error('Could not find end of generateFullQArt');
console.log(`Found function end at line ${funcEndIdx + 1}`);

// Extract the try body (lines between try { and } catch, exclusive)
const tryBody = lines.slice(tryIdx + 1, catchIdx);
// Dedent by 2 spaces (remove the try-block indentation)
const dedentedBody = tryBody.map((l) => (l.startsWith('    ') ? l.slice(2) : l));

// Build the core function params interface
const coreParamsInterface = `interface QArtCoreParams {
  data: string;
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  ecc: ECCLevel;
  maskPattern: number;
  onProgress?: (stage: string, percent: number) => void;
  performanceSettings: QArtPerformanceSettings;
  performanceProfile: QArtPerformanceProfile;
  resolvedSuffixMode: 'numeric' | 'byte';
  encodingSuffixMode: 'numeric' | 'byte';
  encodedData: string;
  actualSuffix: string;
  originalData: string;
  originalDataLength: number;
  versionToUse: number;
  strictSuffix: boolean;
  autoSuffix: boolean;
  suffix?: string;
}`;

// Build the core function
const coreFuncLines = [
  coreParamsInterface,
  '',
  'async function generateFullQArtCore(params: QArtCoreParams): Promise<FullQArtResult> {',
  '  const {',
  '    data, targetImage, ecc, maskPattern, onProgress,',
  '    performanceSettings, performanceProfile,',
  '    resolvedSuffixMode, encodingSuffixMode, encodedData, actualSuffix,',
  '    originalData, originalDataLength, versionToUse,',
  '    strictSuffix, autoSuffix, suffix,',
  '  } = params;',
  '',
  ...dedentedBody,
  '}',
  '',
];

// Build the new try/catch block for generateFullQArt
const newTryCatch = [
  '  try {',
  '    return await generateFullQArtCore({',
  '      data, targetImage, ecc, maskPattern, onProgress,',
  '      performanceSettings, performanceProfile,',
  '      resolvedSuffixMode, encodingSuffixMode, encodedData, actualSuffix,',
  '      originalData, originalDataLength, versionToUse,',
  '      strictSuffix, autoSuffix, suffix,',
  '    });',
];

// Extract the catch block (from } catch to function end)
const catchBlock = lines.slice(catchIdx, funcEndIdx + 1);

// Now reconstruct the file:
// 1. Everything before generateFullQArt
// 2. Core function (interface + function)
// 3. generateFullQArt with new try/catch
const result = [
  ...lines.slice(0, funcStartIdx),
  ...coreFuncLines,
  ...lines.slice(funcStartIdx, tryIdx), // generateFullQArt signature through pre-try code
  ...newTryCatch,
  ...catchBlock,
  ...lines.slice(funcEndIdx + 1),
];

writeFileSync(FILE, result.join('\n'));

// Verify
const newContent = readFileSync(FILE, 'utf8');
console.log(`\nOriginal: ${lines.length} lines`);
console.log(`Modified: ${newContent.split('\n').length} lines`);
console.log(`Delta: +${newContent.split('\n').length - lines.length} lines`);

// Quick sanity checks
if (!newContent.includes('async function generateFullQArtCore(')) {
  throw new Error('Core function not found in output!');
}
if (!newContent.includes('return await generateFullQArtCore({')) {
  throw new Error('Core function call not found in output!');
}
if (!newContent.includes('export async function generateFullQArt(config: FullQArtConfig)')) {
  throw new Error('Original function not found in output!');
}
console.log('Sanity checks passed ✓');
