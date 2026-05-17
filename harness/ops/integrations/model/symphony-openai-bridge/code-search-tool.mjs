import { execSync } from "node:child_process";

import { resolveRequestDir } from "./resolve-request-dir.mjs";

export async function codeSearchTool({ pattern, flags, cwd, maxResults = 15 }) {
  try {
    const baseDir = resolveRequestDir(cwd);
    const flagsStr = flags || "";
    const command = `rg "${pattern.replaceAll(""", '\"')}" ${flagsStr} "${baseDir}" -n --max-count=${maxResults} 2>/dev/null || true`;
    const result = execSync(command, {
      encoding: "utf-8",
      timeout: 10000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const lines = result.split("\n").filter(Boolean);
    const matches = lines.map((line) => {
      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (match) {
        return { file: match[1], line: Number.parseInt(match[2]), content: match[3] };
      }
      return { raw: line };
    });

    return { matches, count: matches.length, pattern };
  } catch (error) {
    return { error: error.message, matches: [] };
  }
}
