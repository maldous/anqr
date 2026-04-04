// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:611

import { execSync } from "node:child_process";

import { resolveRequestDir } from "./resolve-request-dir.mjs";

export async function globTool({ pattern, cwd }) {
  try {
    const baseDir = resolveRequestDir(cwd);
    // Simple glob implementation using find
    const command = `find "${baseDir}" -type f -name "${pattern}" 2>/dev/null | head -100`;
    const result = execSync(command, { encoding: "utf-8", timeout: 10000 });
    const files = result.split("\n").filter(Boolean);
    return { files, count: files.length };
  } catch (error) {
    return { error: error.message, files: [] };
  }
}
