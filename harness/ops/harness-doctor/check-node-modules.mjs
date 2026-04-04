// Generated from ../../scripts/ops/harness-doctor.mjs:74

import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import { ROOT } from "./root.mjs";

export function checkNodeModules() {
  const checks = [];

  // Check for critical packages
  const required = ["@codebuff/sdk", "@modelcontextprotocol/sdk"];
  const optional = ["ollama"];

  for (const pkg of required) {
    const path = resolve(ROOT, "node_modules", pkg, "package.json");
    if (existsSync(path)) {
      try {
        const pkgJson = JSON.parse(readFileSync(path, "utf-8"));
        checks.push({ name: pkg, status: "ok", detail: `v${pkgJson.version}` });
      } catch {
        checks.push({ name: pkg, status: "ok", detail: "installed (version unknown)" });
      }
    } else {
      checks.push({ name: pkg, status: "missing", detail: "not installed" });
    }
  }

  for (const pkg of optional) {
    const path = resolve(ROOT, "node_modules", pkg, "package.json");
    if (existsSync(path)) {
      checks.push({ name: pkg, status: "ok", detail: "installed" });
    } else {
      checks.push({ name: pkg, status: "optional", detail: "not installed" });
    }
  }

  const missing = checks.filter((c) => c.status === "missing");
  return {
    pass: missing.length === 0,
    checks,
    detail:
      missing.length > 0
        ? `Missing: ${missing.map((c) => c.name).join(", ")}`
        : "All required packages installed",
  };
}
