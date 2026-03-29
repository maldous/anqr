/**
 * chunker.mjs — Semantic chunking for code, docs, and config
 *
 * Goals:
 *   - preserve exact-ish source line ranges for retrieval snippets
 *   - prefer semantic boundaries when obvious
 *   - degrade cleanly to size-based chunking for unknown text formats
 *   - stay dependency-free and fast enough for unattended full-repo indexing
 */

import { readFile, readdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { createLogger } from "../logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-chunker");

const DEFAULT_OPTIONS = {
  maxChunkSize: 2_000,
  overlap: 120,
  extensions: [
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".md", ".mdx",
    ".json",
    ".css", ".html",
    ".yml", ".yaml",
    ".sh", ".py",
    ".service", ".timer",
    ".java", ".kt", ".swift",
    ".gradle", ".properties", ".xml",
    ".plist", ".pbxproj", ".xcconfig",
  ],
};

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".sh",
  ".java", ".kt", ".swift",
  ".gradle",
]);
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const JSON_EXTENSIONS = new Set([".json"]);
const TEXT_CONFIG_EXTENSIONS = new Set([
  ".css", ".html", ".yml", ".yaml", ".service", ".timer",
  ".properties", ".xml", ".plist", ".pbxproj", ".xcconfig",
]);

const CODE_BOUNDARY_PATTERNS = [
  /^export\s+(?:default\s+)?(?:async\s+)?function\b/,
  /^export\s+(?:default\s+)?(?:abstract\s+)?class\b/,
  /^(?:async\s+)?function\s+[A-Za-z_$][\w$]*/,
  /^(?:abstract\s+)?class\s+[A-Za-z_$][\w$]*/,
  /^export\s+(?:interface|type|enum)\b/,
  /^(?:interface|type|enum)\s+[A-Za-z_$][\w$]*/,
  /^export\s+(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/,
  /^(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:\(|[A-Za-z_$][\w$]*\s*=>)/,
  /^export\s+default\s+/,
  /^(?:describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*\(/,
];
const DECORATOR_PATTERN = /^@[A-Za-z_$][\w$.()]*/;
const JSDOC_START_PATTERN = /^\s*\/\*\*/;
const MD_HEADING_PATTERN = /^#{1,4}\s+/;

function normalizeExtensions(extensions) {
  return Array.isArray(extensions)
    ? extensions.map((ext) => String(ext || "").toLowerCase())
    : DEFAULT_OPTIONS.extensions;
}

function normalizePathFragment(filePath) {
  return String(filePath).replaceAll(/[^a-zA-Z0-9._/-]/g, "_").slice(-120);
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function makeChunkId(filePath, startLine, endLine, type, content) {
  const seed = `${filePath}:${startLine}:${endLine}:${type}:${content.length}`;
  return `${normalizePathFragment(filePath)}__${startLine}_${endLine}__${hashString(seed)}`;
}

function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

function lineNumberForOffset(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lineStarts[mid] <= offset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, high) + 1;
}

function trimSegmentBounds(text, startOffset, endOffset) {
  let start = Math.max(0, startOffset);
  let end = Math.max(start, endOffset);

  while (start < end) {
    const nextNewline = text.indexOf("\n", start);
    const lineEnd = nextNewline === -1 || nextNewline >= end ? end : nextNewline + 1;
    const slice = text.slice(start, lineEnd);
    if (/^[ \t\r\n]*$/.test(slice)) {
      start = lineEnd;
      continue;
    }
    break;
  }

  while (end > start) {
    const prevNewline = text.lastIndexOf("\n", end - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    const slice = text.slice(lineStart, end);
    if (/^[ \t\r\n]*$/.test(slice)) {
      end = prevNewline === -1 ? 0 : prevNewline;
      continue;
    }
    break;
  }

  return { start, end };
}

function classifyChunk(content, ext) {
  const trimmed = content.trimStart();
  const firstLine = trimmed.split("\n", 1)[0] || "";

  if (MARKDOWN_EXTENSIONS.has(ext)) {
    return MD_HEADING_PATTERN.test(firstLine) ? "section" : "paragraph";
  }

  if (CODE_EXTENSIONS.has(ext)) {
    if (/\bclass\s+[A-Za-z_$][\w$]*/.test(firstLine)) return "class";
    if (/\bfunction\s+[A-Za-z_$][\w$]*/.test(firstLine)) return "function";
    if (/^(?:export\s+)?(?:const|let|var)\s+/.test(firstLine)) return "function";
    if (/^\s*\/\*\*/.test(firstLine)) return "function";
    return "block";
  }

  return "block";
}

function makeChunkFromOffsets(text, lineStarts, filePath, ext, startOffset, endOffset, explicitType = null) {
  const { start, end } = trimSegmentBounds(text, startOffset, endOffset);
  if (end <= start) return null;

  const content = text.slice(start, end);
  if (!content.trim()) return null;

  const startLine = lineNumberForOffset(lineStarts, start);
  const endLine = lineNumberForOffset(lineStarts, Math.max(start, end - 1));
  const type = explicitType || classifyChunk(content, ext);

  return {
    id: makeChunkId(filePath, startLine, endLine, type, content),
    filePath,
    content,
    startLine,
    endLine,
    type,
  };
}

function findPreferredBreak(text, startOffset, candidateEnd, hardEnd) {
  if (candidateEnd >= hardEnd) return hardEnd;

  const minimum = startOffset + Math.floor((candidateEnd - startOffset) * 0.55);
  const newlineBreak = text.lastIndexOf("\n", candidateEnd);
  if (newlineBreak >= minimum) return newlineBreak + 1;

  const sentenceBreak = Math.max(
    text.lastIndexOf("\n\n", candidateEnd),
    text.lastIndexOf(". ", candidateEnd),
    text.lastIndexOf("; ", candidateEnd),
  );
  if (sentenceBreak >= minimum) return sentenceBreak + 1;

  const spaceBreak = text.lastIndexOf(" ", candidateEnd);
  if (spaceBreak >= minimum) return spaceBreak + 1;

  return candidateEnd;
}

function splitRangeBySize(text, startOffset, endOffset, maxChunkSize, overlap) {
  const safeMax = Math.max(200, Number(maxChunkSize) || DEFAULT_OPTIONS.maxChunkSize);
  const safeOverlap = Math.max(0, Math.min(Number(overlap) || 0, Math.floor(safeMax * 0.4)));
  const ranges = [];
  let start = startOffset;
  let iterations = 0;
  const hardLimit = Math.ceil((endOffset - startOffset) / Math.max(1, safeMax - safeOverlap)) + 16;

  while (start < endOffset) {
    iterations += 1;
    if (iterations > hardLimit) {
      logError(`splitRangeBySize exceeded safety ceiling for range ${startOffset}-${endOffset}`);
      break;
    }

    const candidateEnd = Math.min(start + safeMax, endOffset);
    const end = findPreferredBreak(text, start, candidateEnd, endOffset);
    ranges.push({ startOffset: start, endOffset: Math.max(start + 1, end) });

    if (end >= endOffset) break;

    const nextStart = Math.max(start + 1, end - safeOverlap);
    start = nextStart;
  }

  return ranges;
}

function pushSegmentedRange(chunks, text, lineStarts, filePath, ext, startOffset, endOffset, maxChunkSize, overlap, type = null) {
  const length = endOffset - startOffset;
  if (length <= 0) return;

  if (length <= maxChunkSize) {
    const chunk = makeChunkFromOffsets(text, lineStarts, filePath, ext, startOffset, endOffset, type);
    if (chunk) chunks.push(chunk);
    return;
  }

  for (const range of splitRangeBySize(text, startOffset, endOffset, maxChunkSize, overlap)) {
    const chunk = makeChunkFromOffsets(text, lineStarts, filePath, ext, range.startOffset, range.endOffset, type);
    if (chunk) chunks.push(chunk);
  }
}

function includeDecoratorsAndJSDoc(lines, lineIndex) {
  let start = lineIndex;

  while (start > 0 && DECORATOR_PATTERN.test(lines[start - 1].trimStart())) {
    start -= 1;
  }

  if (start > 0 && lines[start - 1].trim() === "*/") {
    for (let i = start - 1; i >= 0; i--) {
      if (JSDOC_START_PATTERN.test(lines[i])) {
        start = i;
        break;
      }
      if (!lines[i].trim()) break;
    }
  } else if (start > 0 && JSDOC_START_PATTERN.test(lines[start - 1])) {
    start -= 1;
  }

  return start;
}

function findCodeBoundaries(lines) {
  const boundaries = new Set([0]);

  for (let i = 1; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (!trimmed) continue;

    if (CODE_BOUNDARY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      boundaries.add(includeDecoratorsAndJSDoc(lines, i));
    }
  }

  return Array.from(boundaries).sort((a, b) => a - b);
}

function lineIndexToOffset(lineStarts, lineIndex, textLength) {
  if (lineIndex <= 0) return 0;
  if (lineIndex >= lineStarts.length) return textLength;
  return lineStarts[lineIndex];
}

function chunkCode(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lines = text.split("\n");
  const lineStarts = buildLineStarts(text);
  const boundaries = findCodeBoundaries(lines);
  const chunks = [];

  for (let i = 0; i < boundaries.length; i++) {
    const startLineIndex = boundaries[i];
    const endLineIndex = i + 1 < boundaries.length ? boundaries[i + 1] : lines.length;
    const startOffset = lineIndexToOffset(lineStarts, startLineIndex, text.length);
    const endOffset = lineIndexToOffset(lineStarts, endLineIndex, text.length);
    pushSegmentedRange(
      chunks,
      text,
      lineStarts,
      filePath,
      ext,
      startOffset,
      endOffset,
      options.maxChunkSize,
      options.overlap,
    );
  }

  return chunks;
}

function chunkMarkdown(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lines = text.split("\n");
  const lineStarts = buildLineStarts(text);
  const boundaries = [0];

  for (let i = 1; i < lines.length; i++) {
    if (MD_HEADING_PATTERN.test(lines[i])) {
      boundaries.push(i);
    }
  }

  const chunks = [];
  for (let i = 0; i < boundaries.length; i++) {
    const startOffset = lineIndexToOffset(lineStarts, boundaries[i], text.length);
    const endOffset = lineIndexToOffset(lineStarts, boundaries[i + 1] ?? lines.length, text.length);
    pushSegmentedRange(
      chunks,
      text,
      lineStarts,
      filePath,
      ext,
      startOffset,
      endOffset,
      options.maxChunkSize,
      options.overlap,
      "section",
    );
  }

  return chunks;
}

function findJsonTopLevelKeyRanges(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const keys = Object.keys(parsed);
    if (keys.length <= 1) return null;

    const lines = text.split("\n");
    const keyLineIndices = [];
    let searchFrom = 0;

    for (const key of keys) {
      const escaped = key.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(`^\\s*"${escaped}"\\s*:`);
      let found = -1;

      for (let i = searchFrom; i < lines.length; i++) {
        if (matcher.test(lines[i])) {
          found = i;
          searchFrom = i + 1;
          break;
        }
      }

      if (found === -1) {
        return null;
      }

      keyLineIndices.push(found);
    }

    return { lines, keyLineIndices };
  } catch {
    return null;
  }
}

function chunkJson(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lineStarts = buildLineStarts(text);

  if (text.length <= options.maxChunkSize) {
    const chunk = makeChunkFromOffsets(text, lineStarts, filePath, ext, 0, text.length, "block");
    return chunk ? [chunk] : [];
  }

  const keyRanges = findJsonTopLevelKeyRanges(text);
  if (keyRanges) {
    const chunks = [];
    for (let i = 0; i < keyRanges.keyLineIndices.length; i++) {
      const startOffset = lineIndexToOffset(lineStarts, keyRanges.keyLineIndices[i], text.length);
      const endOffset = lineIndexToOffset(
        lineStarts,
        keyRanges.keyLineIndices[i + 1] ?? keyRanges.lines.length,
        text.length,
      );
      pushSegmentedRange(
        chunks,
        text,
        lineStarts,
        filePath,
        ext,
        startOffset,
        endOffset,
        options.maxChunkSize,
        options.overlap,
        "block",
      );
    }
    if (chunks.length > 0) return chunks;
  }

  const fallbackChunks = [];
  pushSegmentedRange(
    fallbackChunks,
    text,
    lineStarts,
    filePath,
    ext,
    0,
    text.length,
    options.maxChunkSize,
    options.overlap,
    "block",
  );
  return fallbackChunks;
}

function chunkGenericText(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lineStarts = buildLineStarts(text);
  const chunks = [];
  pushSegmentedRange(
    chunks,
    text,
    lineStarts,
    filePath,
    ext,
    0,
    text.length,
    options.maxChunkSize,
    options.overlap,
    TEXT_CONFIG_EXTENSIONS.has(ext) ? "block" : null,
  );
  return chunks;
}

function isSupportedFile(filePath, extensions) {
  return extensions.includes(extname(filePath).toLowerCase());
}

export async function collectFiles(dirPath, extensions = DEFAULT_OPTIONS.extensions) {
  const supported = normalizeExtensions(extensions);
  const files = [];
  const stack = [resolve(dirPath)];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries;

    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      logWarn(`Failed to read directory ${currentDir}: ${err.message}`);
      continue;
    }

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && isSupportedFile(entry.name, supported)) {
        files.push(fullPath);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

export async function chunkFile(filePath, options = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    extensions: normalizeExtensions(options.extensions || DEFAULT_OPTIONS.extensions),
  };
  const resolvedPath = resolve(filePath);
  const ext = extname(resolvedPath).toLowerCase();

  try {
    const text = await readFile(resolvedPath, "utf-8");
    if (!text.trim()) {
      logDebug(`Skipping empty file: ${resolvedPath}`);
      return [];
    }

    let chunks;
    if (CODE_EXTENSIONS.has(ext)) {
      chunks = chunkCode(text, resolvedPath, opts);
    } else if (MARKDOWN_EXTENSIONS.has(ext)) {
      chunks = chunkMarkdown(text, resolvedPath, opts);
    } else if (JSON_EXTENSIONS.has(ext)) {
      chunks = chunkJson(text, resolvedPath, opts);
    } else {
      chunks = chunkGenericText(text, resolvedPath, opts);
    }

    logDebug(`Chunked ${resolvedPath}: ${chunks.length} chunks`);
    return chunks;
  } catch (err) {
    logError(`Failed to chunk file ${resolvedPath}: ${err.message}`);
    return [];
  }
}

export async function chunkDirectory(dirPath, options = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    extensions: normalizeExtensions(options.extensions || DEFAULT_OPTIONS.extensions),
  };

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

export function chunkText(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!text || !text.trim()) return [];

  const lineStarts = buildLineStarts(text);
  const chunks = [];
  pushSegmentedRange(
    chunks,
    text,
    lineStarts,
    "raw-text",
    "",
    0,
    text.length,
    opts.maxChunkSize,
    opts.overlap,
    "block",
  );
  return chunks;
}
