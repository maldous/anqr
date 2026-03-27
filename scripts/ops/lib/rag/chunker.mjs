/**
 * chunker.mjs — Semantic code and document chunker for RAG pipeline
 *
 * Splits source files into meaningful chunks based on their type:
 *   - Code files (.ts, .tsx, .js, .jsx, .mjs): split on function/class/export boundaries
 *   - Markdown files (.md): split on heading boundaries (## or ###)
 *   - JSON files (.json): treated as single block or split by top-level keys
 *   - Fallback: split on paragraph/line boundaries
 *
 * Each chunk includes metadata: id, filePath, content, startLine, endLine, type.
 *
 * Usage:
 *   import { chunkFile, chunkDirectory, chunkText } from './chunker.mjs';
 *   const chunks = await chunkFile('src/utils.ts');
 *   const allChunks = await chunkDirectory('src/');
 */

import { readFile, readdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { createLogger } from "../logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-chunker");

/** Default options for chunking */
const DEFAULT_OPTIONS = {
  /** Approximate max chunk size in characters (~500 tokens ≈ 2000 chars) */
  maxChunkSize: 2000,
  /** Overlap between consecutive chunks in characters */
  overlap: 100,
  /** File extensions to process */
  extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".json"],
};

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const MARKDOWN_EXTENSIONS = new Set([".md"]);
const JSON_EXTENSIONS = new Set([".json"]);

/**
 * Regex patterns for detecting code boundaries.
 * These intentionally use simple regex (not AST) for speed and zero dependencies.
 */
const CODE_BOUNDARY_PATTERNS = [
  // export default function / export function
  /^export\s+(?:default\s+)?(?:async\s+)?function\s+/,
  // export default class / export class
  /^export\s+(?:default\s+)?(?:abstract\s+)?class\s+/,
  // standalone function declarations
  /^(?:async\s+)?function\s+\w+/,
  // class declarations
  /^(?:abstract\s+)?class\s+\w+/,
  // export const/let/var (arrow functions, objects, etc.)
  /^export\s+(?:const|let|var)\s+/,
  // const/let/var with arrow function on same or next line
  /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(/,
  /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\w+\s*=>/,
  // interface / type declarations (TypeScript)
  /^export\s+(?:interface|type)\s+/,
  /^(?:interface|type)\s+\w+/,
  // JSDoc comment blocks (often precede declarations)
  /^\/\*\*/,
];

/**
 * Markdown heading pattern (## or ### level)
 */
const MD_HEADING_PATTERN = /^#{1,3}\s+/;

let chunkIdCounter = 0;

/**
 * Generate a unique chunk ID
 * @param {string} filePath - Source file path
 * @param {number} index - Chunk index within file
 * @returns {string} Unique chunk identifier
 */
function makeChunkId(filePath, index) {
  chunkIdCounter += 1;
  const safePath = filePath.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `${safePath}__${index}__${chunkIdCounter}`;
}

/**
 * Determine chunk type based on the first meaningful line of content
 * @param {string} content - Chunk content
 * @param {string} ext - File extension
 * @returns {'function'|'class'|'section'|'paragraph'|'block'} Chunk type
 */
function classifyChunk(content, ext) {
  const trimmed = content.trimStart();
  const firstLine = trimmed.split("\n")[0] || "";

  if (MARKDOWN_EXTENSIONS.has(ext)) {
    if (MD_HEADING_PATTERN.test(firstLine)) return "section";
    return "paragraph";
  }

  if (CODE_EXTENSIONS.has(ext)) {
    if (/class\s+\w+/.test(firstLine)) return "class";
    if (/function\s+\w+/.test(firstLine) || /=>\s*[{(]?/.test(firstLine)) return "function";
    if (/^export\s+/.test(firstLine)) return "function";
    if (firstLine.startsWith('/**')) return "function";
    return "block";
  }

  return "block";
}

/**
 * Find line boundaries (1-indexed) for a substring within the full text
 * @param {string} fullText - Complete file content
 * @param {number} charStart - Character start offset
 * @param {number} charEnd - Character end offset
 * @returns {{ startLine: number, endLine: number }}
 */
function findLineRange(fullText, charStart, charEnd) {
  let startLine = 1;
  let endLine = 1;

  for (let i = 0; i < charEnd && i < fullText.length; i++) {
    if (i === charStart) startLine = endLine;
    if (fullText[i] === "\n") endLine++;
  }

  // If charStart is at or past the end
  if (charStart >= fullText.length) {
    startLine = endLine;
  }

  return { startLine, endLine };
}

/**
 * Split code file into chunks based on declaration boundaries
 * @param {string} text - File content
 * @param {string} filePath - File path for metadata
 * @param {object} options - Chunking options
 * @returns {Array<object>} Array of chunk objects
 */
function chunkCode(text, filePath, options) {
  const { maxChunkSize, overlap } = options;
  const lines = text.split("\n");
  const ext = extname(filePath);

  // Find boundary line indices
  const boundaries = [0]; // always start at line 0
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trimStart();
    if (line === "") continue;
    for (const pattern of CODE_BOUNDARY_PATTERNS) {
      if (pattern.test(line)) {
        // Also include the JSDoc block before this declaration if present
        let boundaryLine = i;
        if (i > 0 && lines[i - 1]?.trim() === "*/") {
          // Walk back to find the start of the JSDoc
          for (let j = i - 1; j >= 0; j--) {
            if (lines[j]?.trimStart().startsWith("/**")) {
              boundaryLine = j;
              break;
            }
          }
        } else if (lines[i - 1]?.trimStart().startsWith("/**")) {
          boundaryLine = i - 1;
        }
        if (!boundaries.includes(boundaryLine)) {
          boundaries.push(boundaryLine);
        }
        break;
      }
    }
  }

  boundaries.sort((a, b) => a - b);

  // Build chunks from boundaries
  const chunks = [];
  for (let b = 0; b < boundaries.length; b++) {
    const startIdx = boundaries[b];
    const endIdx = b + 1 < boundaries.length ? boundaries[b + 1] : lines.length;
    const chunkLines = lines.slice(startIdx, endIdx);
    let content = chunkLines.join("\n").trim();

    if (content.length === 0) continue;

    // If chunk exceeds max size, split it further
    if (content.length > maxChunkSize) {
      const subChunks = splitBySize(content, maxChunkSize, overlap);
      for (const sub of subChunks) {
        const charStart = text.indexOf(sub.slice(0, 80));
        const { startLine, endLine } = charStart >= 0
          ? findLineRange(text, charStart, charStart + sub.length)
          : { startLine: startIdx + 1, endLine: endIdx };

        chunks.push({
          id: makeChunkId(filePath, chunks.length),
          filePath,
          content: sub,
          startLine,
          endLine,
          type: classifyChunk(sub, ext),
        });
      }
    } else {
      chunks.push({
        id: makeChunkId(filePath, chunks.length),
        filePath,
        content,
        startLine: startIdx + 1,
        endLine: endIdx,
        type: classifyChunk(content, ext),
      });
    }
  }

  return chunks;
}

/**
 * Split markdown file into chunks based on headings
 * @param {string} text - File content
 * @param {string} filePath - File path for metadata
 * @param {object} options - Chunking options
 * @returns {Array<object>} Array of chunk objects
 */
function chunkMarkdown(text, filePath, options) {
  const { maxChunkSize, overlap } = options;
  const lines = text.split("\n");

  // Find heading boundaries
  const boundaries = [0];
  for (let i = 1; i < lines.length; i++) {
    if (MD_HEADING_PATTERN.test(lines[i])) {
      boundaries.push(i);
    }
  }

  const chunks = [];
  for (let b = 0; b < boundaries.length; b++) {
    const startIdx = boundaries[b];
    const endIdx = b + 1 < boundaries.length ? boundaries[b + 1] : lines.length;
    const content = lines.slice(startIdx, endIdx).join("\n").trim();

    if (content.length === 0) continue;

    if (content.length > maxChunkSize) {
      const subChunks = splitBySize(content, maxChunkSize, overlap);
      for (const sub of subChunks) {
        chunks.push({
          id: makeChunkId(filePath, chunks.length),
          filePath,
          content: sub,
          startLine: startIdx + 1,
          endLine: endIdx,
          type: classifyChunk(sub, ".md"),
        });
      }
    } else {
      chunks.push({
        id: makeChunkId(filePath, chunks.length),
        filePath,
        content,
        startLine: startIdx + 1,
        endLine: endIdx,
        type: classifyChunk(content, ".md"),
      });
    }
  }

  return chunks;
}

/**
 * Split JSON file into chunks by top-level keys or as a single block
 * @param {string} text - File content
 * @param {string} filePath - File path for metadata
 * @param {object} options - Chunking options
 * @returns {Array<object>} Array of chunk objects
 */
function chunkJSON(text, filePath, options) {
  const { maxChunkSize } = options;

  // If small enough, return as a single block
  if (text.length <= maxChunkSize) {
    return [
      {
        id: makeChunkId(filePath, 0),
        filePath,
        content: text.trim(),
        startLine: 1,
        endLine: text.split("\n").length,
        type: "block",
      },
    ];
  }

  // Try to split by top-level keys
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const chunks = [];
      for (const [key, value] of Object.entries(parsed)) {
        const content = JSON.stringify({ [key]: value }, null, 2);
        chunks.push({
          id: makeChunkId(filePath, chunks.length),
          filePath,
          content,
          startLine: 1,
          endLine: content.split("\n").length,
          type: "block",
        });
      }
      return chunks;
    }
  } catch {
    // Fall through to size-based splitting
  }

  return splitBySize(text, maxChunkSize, options.overlap).map((content, i) => ({
    id: makeChunkId(filePath, i),
    filePath,
    content,
    startLine: 1,
    endLine: content.split("\n").length,
    type: "block",
  }));
}

/**
 * Split text into chunks by size with overlap
 * @param {string} text - Text to split
 * @param {number} maxSize - Maximum chunk size in characters
 * @param {number} overlap - Overlap between chunks in characters
 * @returns {string[]} Array of text chunks
 */
function splitBySize(text, maxSize, overlap) {
  const chunks = [];
  let start = 0;
  const safeOverlap = Math.min(overlap, Math.floor(maxSize * 0.5)); // Cap overlap at 50% of maxSize
  let iterationCount = 0;
  const maxIterations = Math.ceil(text.length / (maxSize - safeOverlap)) + 10; // Safety ceiling

  while (start < text.length) {
    iterationCount++;
    
    // Fail-safe: prevent infinite loops
    if (iterationCount > maxIterations) {
      logError(`splitBySize exceeded max iterations (${maxIterations}) - text may be too large or overlap too high`);
      break;
    }

    let end = Math.min(start + maxSize, text.length);

    if (end < text.length) {
      // Try to break at a newline boundary
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > start + maxSize * 0.5) {
        end = lastNewline + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward - ensure we always make progress
    const nextStart = end - safeOverlap;
    if (nextStart <= start) {
      // No progress would be made - force forward movement
      start = end;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}

/**
 * Check if a file extension is supported for chunking
 * @param {string} filePath - Path to check
 * @param {string[]} extensions - Allowed extensions
 * @returns {boolean}
 */
function isSupportedFile(filePath, extensions) {
  const ext = extname(filePath).toLowerCase();
  return extensions.includes(ext);
}

/**
 * Recursively collect all files in a directory
 * @param {string} dirPath - Directory to scan
 * @param {string[]} extensions - Allowed extensions
 * @returns {Promise<string[]>} Array of file paths
 */
export async function collectFiles(dirPath, extensions) {
  const files = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      // Skip hidden directories/files and node_modules
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

      if (entry.isDirectory()) {
        const subFiles = await collectFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile() && isSupportedFile(entry.name, extensions)) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    logWarn(`Failed to read directory ${dirPath}: ${err.message}`);
  }

  return files;
}

/**
 * Chunk a single file into semantic pieces
 *
 * @param {string} filePath - Path to the file to chunk
 * @param {object} [options] - Chunking options
 * @param {number} [options.maxChunkSize=2000] - Max chunk size in characters
 * @param {number} [options.overlap=100] - Overlap between chunks in characters
 * @returns {Promise<Array<{id: string, filePath: string, content: string, startLine: number, endLine: number, type: string}>>}
 */
export async function chunkFile(filePath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const resolvedPath = resolve(filePath);
    const text = await readFile(resolvedPath, "utf-8");
    const ext = extname(filePath).toLowerCase();

    if (text.trim().length === 0) {
      logDebug(`Skipping empty file: ${filePath}`);
      return [];
    }

    let chunks;

    if (CODE_EXTENSIONS.has(ext)) {
      chunks = chunkCode(text, filePath, opts);
    } else if (MARKDOWN_EXTENSIONS.has(ext)) {
      chunks = chunkMarkdown(text, filePath, opts);
    } else if (JSON_EXTENSIONS.has(ext)) {
      chunks = chunkJSON(text, filePath, opts);
    } else {
      // Fallback: split by size
      const parts = splitBySize(text, opts.maxChunkSize, opts.overlap);
      chunks = parts.map((content, i) => ({
        id: makeChunkId(filePath, i),
        filePath,
        content,
        startLine: 1,
        endLine: content.split("\n").length,
        type: "block",
      }));
    }

    logDebug(`Chunked ${filePath}: ${chunks.length} chunks`);
    return chunks;
  } catch (err) {
    logError(`Failed to chunk file ${filePath}: ${err.message}`);
    return [];
  }
}

/**
 * Chunk all supported files in a directory (recursively)
 *
 * @param {string} dirPath - Directory to scan and chunk
 * @param {object} [options] - Chunking options
 * @param {number} [options.maxChunkSize=2000] - Max chunk size in characters
 * @param {number} [options.overlap=100] - Overlap between chunks in characters
 * @param {string[]} [options.extensions] - File extensions to include
 * @returns {Promise<Array<{id: string, filePath: string, content: string, startLine: number, endLine: number, type: string}>>}
 */
export async function chunkDirectory(dirPath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  logInfo(`Chunking directory: ${dirPath}`);

  const files = await collectFiles(resolve(dirPath), opts.extensions);
  logInfo(`Found ${files.length} supported files`);

  const allChunks = [];
  for (const file of files) {
    const chunks = await chunkFile(file, opts);
    allChunks.push(...chunks);
  }

  logInfo(`Total chunks generated: ${allChunks.length}`);
  return allChunks;
}

/**
 * Chunk raw text into pieces (no file-type awareness)
 *
 * @param {string} text - Raw text to chunk
 * @param {object} [options] - Chunking options
 * @param {number} [options.maxChunkSize=2000] - Max chunk size in characters
 * @param {number} [options.overlap=100] - Overlap between chunks in characters
 * @returns {Array<{id: string, filePath: string, content: string, startLine: number, endLine: number, type: string}>}
 */
export function chunkText(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!text || text.trim().length === 0) {
    return [];
  }

  const parts = splitBySize(text, opts.maxChunkSize, opts.overlap);

  return parts.map((content, i) => ({
    id: makeChunkId("raw-text", i),
    filePath: "raw-text",
    content,
    startLine: 1,
    endLine: content.split("\n").length,
    type: "block",
  }));
}
