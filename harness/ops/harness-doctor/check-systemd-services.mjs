import { execFileSync } from "node:child_process";

const CRITICAL_SERVICES = [
  "anqr-symphony-router",
  "anqr-symphony-integrator",
  "anqr-discord-router",
  "anqr-linear-webhook",
];

export function checkSystemdServices() {
  const isProduction = process.env.ANQR_RUNTIME_MODE === "production";

  const executorUnits =
    process.env.ANQR_HARNESS_DOCTOR_EXECUTORS ||
    process.env.ANQR_HARNESS_DOCTOR_RUNNERS ||
    "anqr-symphony-executor@1,anqr-symphony-executor@2";
  const services = [
    ...executorUnits
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    "anqr-symphony-router",
    "anqr-symphony-integrator",
    "anqr-symphony-worktree-recovery",
    "anqr-discord-router",
    "anqr-linear-webhook",
    "anqr-watchdog",
    "anqr-worktree-health",
  ];

  const results = [];
  for (const service of services) {
    try {
      const out = execFileSync("systemctl", ["is-active", "--user", service], {
        stdio: "pipe",
        encoding: "utf-8",
      });
      const status = out.trim();
      results.push({ name: service, status: status === "active" ? "active" : status });
    } catch {
      results.push({ name: service, status: "inactive/not-found" });
    }
  }

  const activeCount = results.filter((r) => r.status === "active").length;
  const criticalDown = results.filter(
    (r) => CRITICAL_SERVICES.includes(r.name) && r.status !== "active",
  );

  if (isProduction && criticalDown.length > 0) {
    const missing = criticalDown.map((r) => `${r.name} (${r.status})`).join(", ");
    return {
      pass: false,
      detail: `CRITICAL: ${criticalDown.length} required service(s) not active: ${missing}`,
      services: results,
      criticalDown,
    };
  }

  if (activeCount === 0 && !isProduction) {
    return {
      pass: true,
      detail: `Services not running (dev environment — ${results.length} checked, 0 active)`,
      services: results,
      criticalDown: [],
    };
  }

  const detail =
    criticalDown.length > 0
      ? `${activeCount}/${results.length} active — WARNING: ${criticalDown.length} critical service(s) down`
      : `All ${activeCount}/${results.length} services active`;

  return {
    pass: criticalDown.length === 0,
    detail,
    services: results,
    criticalDown,
  };
}
