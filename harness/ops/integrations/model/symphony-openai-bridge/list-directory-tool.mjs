// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:676

import path from "node:path";
import fs from "node:fs";

import { resolveRequestPath } from "./resolve-request-path.mjs";
import { logError } from "./logger.mjs";

export async function listDirectoryTool({ path: dirPath }) {
  try {
    const fullPath = resolveRequestPath(dirPath || ".");
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    const directories = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    return { files, directories, path: dirPath };
  } catch (error) {
    logError(`listDirectoryTool failed: ${error.message}`, { path: dirPath });
    return { error: error.message };
  }
}
