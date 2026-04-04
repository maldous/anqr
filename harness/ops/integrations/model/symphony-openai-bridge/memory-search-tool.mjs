// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:627

import path from "node:path";
import fs from "node:fs";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";

export async function memorySearchTool({ query }) {
  try {
    const memoryFile = path.join(getCurrentRequestCwd(), "MEMORY.md");
    const knowledgeFile = path.join(getCurrentRequestCwd(), "knowledge.md");
    const results = [];

    // Search MEMORY.md
    if (fs.existsSync(memoryFile)) {
      const content = fs.readFileSync(memoryFile, "utf-8");
      const lines = content.split("\n");
      const matches = lines
        .map((line, idx) => ({ line, idx }))
        .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

      if (matches.length > 0) {
        results.push({
          file: "MEMORY.md",
          matches: matches.map((m) => ({ line: m.line, lineNumber: m.idx + 1 })),
        });
      }
    }

    // Search knowledge.md
    if (fs.existsSync(knowledgeFile)) {
      const content = fs.readFileSync(knowledgeFile, "utf-8");
      const lines = content.split("\n");
      const matches = lines
        .map((line, idx) => ({ line, idx }))
        .filter(({ line }) => line.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

      if (matches.length > 0) {
        results.push({
          file: "knowledge.md",
          matches: matches.map((m) => ({ line: m.line, lineNumber: m.idx + 1 })),
        });
      }
    }

    return { results, count: results.length };
  } catch (error) {
    return { error: error.message, results: [] };
  }
}
