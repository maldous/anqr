import { execFileSync } from "node:child_process";
import { extname, join, relative } from "node:path";
import { readFile } from "node:fs/promises";

import { EXCLUDED_DIRS } from "./excluded-dirs.mjs";
import { INDEXABLE_EXTENSIONS } from "./indexable-extensions.mjs";
import { MAX_FILE_BYTES } from "./max-file-bytes.mjs";

export async function collectProjectFiles(rootDir) {
  try {
    const raw = execFileSync("git", ["ls-files", "-z"], {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 20 * 1024 * 1024,
    });
    const trackedFiles = raw.split("\0").filter(Boolean);
    const files = [];

    for (const relPath of trackedFiles) {
      const normalized = relPath.replaceAll("\\", "/");
      const parts = normalized.split("/");
      if (parts.some((part) => EXCLUDED_DIRS.has(part))) continue;

      const ext = extname(normalized);
      if (!INDEXABLE_EXTENSIONS.has(ext)) continue;

      const fullPath = join(rootDir, normalized);
      try {
        const content = await readFile(fullPath, "utf-8");
        if (content.length > MAX_FILE_BYTES) continue;
        files.push({ path: normalized, content });
      } catch {
        // skip unreadable tracked files
      }
    }

    return files;
  } catch {
    // Fall back to recursive directory walk when git metadata is unavailable.
  }

  const files = [];

  /**
   * Recursively walk a directory.
   * @param {string} dir
   */
  async function walk(dir) {
    let entries;
    try {
      const { readdir } = await import("node:fs/promises");
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          await walk(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = extname(entry.name);
      if (!INDEXABLE_EXTENSIONS.has(ext)) continue;

      try {
        const content = await readFile(fullPath, "utf-8");
        if (content.length > MAX_FILE_BYTES) continue; // skip very large files

        files.push({
          path: relative(rootDir, fullPath),
          content,
        });
      } catch {
        // skip files we cannot read
      }
    }
  }

  await walk(rootDir);
  return files;
}
