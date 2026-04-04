// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1073

import { searchFiles as hybridSearchFiles } from "../../../lib/search/hybrid-search.mjs";
import { execSync } from "node:child_process";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function findFilesTool({ prompt }) {
  try {
    logInfo(`🔍 Finding files: ${prompt.slice(0, 100)}`);

    // Attempt hybrid search (BM25 + optional embedding re-ranking)
    try {
      const result = await hybridSearchFiles(prompt, {
        rootDir: getCurrentRequestCwd(),
        topK: 20,
        useEmbeddings: true,
      });

      if (result.files.length > 0) {
        logInfo(
          `📊 Hybrid search (${result.method}): ${result.count} results for "${prompt.slice(0, 60)}"`,
        );
        return {
          files: result.files,
          count: result.count,
          query: prompt.slice(0, 100),
          method: result.method,
        };
      }
    } catch (err) {
      logWarn(`Hybrid search failed, falling back to basic: ${err.message}`);
    }

    // Fallback: basic glob-based search
    const searchTerms = prompt
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".md"];

    const results = [];
    for (const ext of extensions) {
      try {
        const cmd = `find . -type f -name "*${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -50`;
        const output = execSync(cmd, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 5000,
        });
        const files = output.split("\n").filter(Boolean);

        for (const file of files) {
          const lowerPath = file.toLowerCase();
          const score = searchTerms.reduce(
            (sum, term) => sum + (lowerPath.includes(term) ? 1 : 0),
            0,
          );
          if (score > 0) {
            results.push({ path: file.replace(/^\.\//, ""), score });
          }
        }
      } catch {
        /* ignore */
      }
    }

    const sorted = results.sort((a, b) => b.score - a.score).slice(0, 20);
    const paths = sorted.map((r) => r.path);

    return {
      files: paths,
      count: paths.length,
      query: prompt.slice(0, 100),
      method: "basic",
    };
  } catch (error) {
    return { error: error.message, files: [] };
  }
}
