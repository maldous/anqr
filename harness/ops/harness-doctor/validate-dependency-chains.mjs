import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Systemd built-in units — not expected in the services directory. */
const SYSTEMD_BUILTINS = new Set([
  "network-online.target",
  "network.target",
  "timers.target",
  "default.target",
  "multi-user.target",
  "basic.target",
  "sockets.target",
]);

/**
 * Validate that `Requires=` dependencies point to services that actually exist.
 *
 * @param {string} servicesDir
 * @returns {string[]} issues found
 */
export function validateDependencyChains(servicesDir) {
  const issues = [];
  const serviceFiles = readdirSync(servicesDir).filter((f) => f.endsWith(".service"));
  const available = new Set(serviceFiles);

  for (const svc of serviceFiles) {
    const content = readFileSync(join(servicesDir, svc), "utf-8");
    const requiresMatch = content.match(/^Requires=(.+)$/m);
    if (!requiresMatch) continue;

    for (const dep of requiresMatch[1].split(/\s+/)) {
      if (SYSTEMD_BUILTINS.has(dep)) continue;
      const templateForm = dep.replace(/@\d+\.service$/, "@.service");
      if (!available.has(dep) && !available.has(templateForm)) {
        issues.push(`${svc}: Requires=${dep} but ${dep} not found in services directory`);
      }
    }
  }

  return issues;
}
