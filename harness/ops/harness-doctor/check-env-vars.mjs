// Generated from ../../scripts/ops/harness-doctor.mjs:38

export function checkEnvVars() {
  const checks = [];

  // Check for critical env vars
  const critical = ["LINEAR_API_KEY", "CODEBUFF_API_KEY"];
  const optional = ["OLLAMA_API_BASE", "SONAR_TOKEN"];

  for (const key of critical) {
    const val = process.env[key];
    if (!val || val === "REPLACE" || val.includes("REPLACE_WITH_REAL")) {
      checks.push({ name: key, status: "missing", detail: "not set or placeholder" });
    } else {
      checks.push({ name: key, status: "ok", detail: "set" });
    }
  }

  for (const key of optional) {
    const val = process.env[key];
    if (!val || val === "REPLACE") {
      checks.push({ name: key, status: "optional", detail: "not set" });
    } else {
      checks.push({ name: key, status: "ok", detail: "set" });
    }
  }

  const criticalMissing = checks.filter((c) => c.status === "missing");
  return {
    pass: criticalMissing.length === 0,
    checks,
    detail:
      criticalMissing.length > 0
        ? `Missing: ${criticalMissing.map((c) => c.name).join(", ")}`
        : "All critical env vars set",
  };
}
