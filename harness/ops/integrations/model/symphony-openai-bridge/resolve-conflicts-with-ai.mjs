// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1608

import { execSync, execFileSync } from "node:child_process";
import { selectProvider } from "../symphony-credit-gate.mjs";
import path from "node:path";
import fs from "node:fs";
import { generateText } from "ai";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { MAX_CONFLICT_FILES } from "./max-conflict-files.mjs";
import { MAX_CONFLICT_FILE_SIZE } from "./max-conflict-file-size.mjs";
import { createProviderModel } from "./create-provider-model.mjs";
import { voiceAnnounce } from "./voice-announce.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function resolveConflictsWithAI() {
  const conflictOutput = execSync("git diff --name-only --diff-filter=U", {
    cwd: BRIDGE_ROOT,
    encoding: "utf-8",
    timeout: 5000,
    stdio: "pipe",
  }).trim();
  const conflictFiles = conflictOutput.split("\n").filter(Boolean);

  if (conflictFiles.length === 0) return true;
  if (conflictFiles.length > MAX_CONFLICT_FILES) {
    logWarn(`⚠️ Too many conflicting files (${conflictFiles.length}) — skipping AI resolution`);
    return false;
  }

  logInfo(`🔧 Resolving ${conflictFiles.length} conflict(s) with AI: ${conflictFiles.join(", ")}`);
  voiceAnnounce(
    `Resolving ${conflictFiles.length} merge conflict${conflictFiles.length > 1 ? "s" : ""} with AI.`,
  );

  const provider = await selectProvider({ excludeNames: ["codebuff"] });
  if (!provider) {
    logWarn(`⚠️ No provider available for conflict resolution`);
    return false;
  }

  let apiKey = provider.apiKey;
  if (!apiKey && provider.envKey) apiKey = process.env[provider.envKey];
  if (!apiKey && provider.loadToken) {
    try {
      apiKey = await provider.loadToken();
    } catch {
      /* ignore */
    }
  }

  let model;
  try {
    model = createProviderModel({ ...provider, apiKey });
  } catch (err) {
    logWarn(`⚠️ Failed to create model for conflict resolution (${provider.name}): ${err.message}`);
    return false;
  }

  for (const file of conflictFiles) {
    try {
      const filePath = path.join(BRIDGE_ROOT, file);
      const content = fs.readFileSync(filePath, "utf-8");

      if (content.length > MAX_CONFLICT_FILE_SIZE) {
        logWarn(`⚠️ File ${file} too large for AI resolution (${content.length} bytes)`);
        return false;
      }

      const result = await generateText({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a git merge conflict resolver. You receive a file containing git conflict markers (<<<<<<< , =======, >>>>>>>). Output ONLY the resolved file content with all conflicts resolved. Prefer keeping both sides' changes when possible. When changes truly conflict, prefer the incoming changes (after =======). Do not add explanation, markdown formatting, or code fences — output only the raw file content.",
          },
          {
            role: "user",
            content: `Resolve all merge conflicts in this file (${file}):\n\n${content}`,
          },
        ],
        maxTokens: 16384,
      });

      let resolved = (result.text || "").replace(/^\s*```[^\n]*\n/, "").replace(/\n```\s*$/, "");
      if (!resolved || resolved.includes("<<<<<<<") || resolved.includes(">>>>>>>")) {
        logWarn(`⚠️ AI resolution for ${file} still contains conflict markers`);
        return false;
      }
      if (resolved.length < content.length * 0.3) {
        logWarn(
          `⚠️ AI resolution for ${file} suspiciously short (${resolved.length} vs ${content.length} original)`,
        );
        return false;
      }

      fs.writeFileSync(filePath, resolved, "utf-8");
      execFileSync("git", ["add", "--", file], {
        cwd: BRIDGE_ROOT,
        encoding: "utf-8",
        timeout: 5000,
        stdio: "pipe",
      });
      logInfo(`✅ Resolved conflict in ${file} via AI (${provider.name})`);
    } catch (err) {
      logWarn(`⚠️ Failed to resolve conflict in ${file}: ${err.message}`);
      return false;
    }
  }

  return true;
}
