// Generated from ../../scripts/ops/harness-doctor.mjs:284

import { resolve } from "node:path";
import { existsSync } from "node:fs";

import { ROOT } from "./root.mjs";

export function checkHarnessConfig() {
  const configs = [
    resolve(ROOT, ".env"),
    resolve(ROOT, "scripts/ops/integrations/model/litellm-config.yaml"),
    // Note: symphony-config.yaml is optional (can be generated or use defaults)
  ];

  const results = [];
  for (const path of configs) {
    const exists = existsSync(path);
    results.push({
      file: path.split("/").slice(-2).join("/"),
      exists,
    });
  }

  const missing = results.filter((r) => !r.exists);
  return {
    pass: missing.length === 0,
    detail:
      missing.length > 0
        ? `Missing: ${missing.map((r) => r.file).join(", ")}`
        : "All config files present",
    configs: results,
  };
}
