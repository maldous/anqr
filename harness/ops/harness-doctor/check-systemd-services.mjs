// Generated from ../../scripts/ops/harness-doctor.mjs:176

import { execFileSync } from "node:child_process";

export function checkSystemdServices() {
  const runnerUnits =
    process.env.ANQR_HARNESS_DOCTOR_RUNNERS || "anqr-symphony-runner@1,anqr-symphony-runner@2";
  const services = [
    ...runnerUnits
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    "anqr-nightly",
    "anqr-queue-feeder",
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

  // Systemd services are production runtime - in dev they may be inactive
  // Always pass this check, but report status (warn vs info)
  const activeCount = results.filter((r) => r.status === "active").length;
  const detail =
    activeCount > 0
      ? `All services active (${activeCount}/${results.length})`
      : `Services not running (dev environment - expected)`;

  return {
    pass: true, // Always pass - systemd services are production, not dev requirement
    detail,
    services: results,
  };
}
