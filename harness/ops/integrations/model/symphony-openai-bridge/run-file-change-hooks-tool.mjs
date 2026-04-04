// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:798

import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";

export async function runFileChangeHooksTool({ files }) {
  try {
    // files is already normalized to array by the schema transform
    // If no files provided, return early with success
    if (!files || files.length === 0) {
      return { success: true, message: "No files to process" };
    }

    // Check if codebuff.json has fileChangeHooks configured
    const codebuffConfigPath = path.join(getCurrentRequestCwd(), "codebuff.json");
    let hooks = [];

    if (fs.existsSync(codebuffConfigPath)) {
      const config = JSON.parse(fs.readFileSync(codebuffConfigPath, "utf-8"));
      hooks = config.fileChangeHooks || [];
    }

    if (hooks.length === 0) {
      return { success: true, message: "No file change hooks configured" };
    }

    const results = [];
    for (const hook of hooks) {
      try {
        const command = hook.replace("{files}", files.join(" "));
        const result = execSync(command, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
        results.push({ hook, success: true, output: result });
      } catch (err) {
        results.push({ hook, success: false, error: err.message });
      }
    }

    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
