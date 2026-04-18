import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

import { parseEnvKeys } from "./parse-env-keys.mjs";

/**
 * Reconcile env key inventory between the repo template and live env files.
 *
 * Modes:
 * - "check" (default): report drift without modifying files
 * - "sync-to-live": append missing keys (with empty values) to the live file
 * - "sync-to-template": append extra keys (with empty values) to the repo template
 *
 * NEVER reads or writes secret values. Only operates on key names.
 * When appending, adds `KEY=` (empty value) with a comment indicating it was auto-added.
 *
 * @param {"check" | "sync-to-live" | "sync-to-template"} mode
 * @returns {{ pass: boolean, detail: string, actions: string[] }}
 */
export async function reconcileEnvKeys(mode = "check") {
  const { ROOT } = await import("./root.mjs");
  const REPO_TEMPLATE = resolve(ROOT, "services/systemd/anqr-ops.env");
  const LIVE_HOST_FILE = resolve(homedir(), ".config/systemd/user/anqr-ops.env");
  const SYMPHONY_ENV = resolve(homedir(), ".config/symphony/anqr.env");

  const actions = [];

  if (!existsSync(REPO_TEMPLATE)) {
    return { pass: false, detail: `Repo template missing: ${REPO_TEMPLATE}`, actions: [] };
  }
  if (!existsSync(LIVE_HOST_FILE)) {
    return { pass: false, detail: `Live env file missing: ${LIVE_HOST_FILE}`, actions: [] };
  }

  const templateKeys = new Set(parseEnvKeys(REPO_TEMPLATE));
  const liveKeys = new Set(parseEnvKeys(LIVE_HOST_FILE));

  const missingFromLive = [...templateKeys].filter((k) => !liveKeys.has(k));
  const extraInLive = [...liveKeys].filter((k) => !templateKeys.has(k));

  if (mode === "sync-to-live" && missingFromLive.length > 0) {
    const liveContent = readFileSync(LIVE_HOST_FILE, "utf-8");
    const additions = missingFromLive
      .map((k) => `# auto-added by reconcile-env-keys\n${k}=`)
      .join("\n");
    const newContent = liveContent.trimEnd() + "\n\n" + additions + "\n";
    writeFileSync(LIVE_HOST_FILE, newContent, "utf-8");
    actions.push(
      `Added ${missingFromLive.length} missing keys to live file: ${missingFromLive.join(", ")}`,
    );

    // Also sync to symphony env if it exists
    if (existsSync(SYMPHONY_ENV)) {
      const symphonyKeys = new Set(parseEnvKeys(SYMPHONY_ENV));
      const missingSymphony = missingFromLive.filter((k) => !symphonyKeys.has(k));
      if (missingSymphony.length > 0) {
        const symContent = readFileSync(SYMPHONY_ENV, "utf-8");
        const symAdditions = missingSymphony
          .map((k) => `# auto-added by reconcile-env-keys\n${k}=`)
          .join("\n");
        writeFileSync(SYMPHONY_ENV, symContent.trimEnd() + "\n\n" + symAdditions + "\n", "utf-8");
        actions.push(`Added ${missingSymphony.length} missing keys to symphony env`);
      }
    }
  } else if (mode === "sync-to-template" && extraInLive.length > 0) {
    const templateContent = readFileSync(REPO_TEMPLATE, "utf-8");
    const additions = extraInLive
      .map((k) => `# auto-added from live by reconcile-env-keys\n${k}=`)
      .join("\n");
    const newContent = templateContent.trimEnd() + "\n\n" + additions + "\n";
    writeFileSync(REPO_TEMPLATE, newContent, "utf-8");
    actions.push(`Added ${extraInLive.length} extra keys to template: ${extraInLive.join(", ")}`);
  } else if (mode === "check") {
    if (missingFromLive.length > 0) {
      actions.push(`Missing from live: ${missingFromLive.join(", ")}`);
    }
    if (extraInLive.length > 0) {
      actions.push(`Extra in live (not in template): ${extraInLive.join(", ")}`);
    }
  }

  const pass = missingFromLive.length === 0 && extraInLive.length === 0;
  return {
    pass,
    detail: pass ? `Env keys aligned (${templateKeys.size} keys)` : actions.join("; "),
    actions,
    missingFromLive,
    extraInLive,
  };
}
