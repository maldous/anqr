import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { logWarn } from "./logger.mjs";

export function getSystemInfo() {
  try {
    const hostname = execSync("hostname", { encoding: "utf-8", timeout: 2000 }).trim();
    const uptime = execSync("uptime -p", { encoding: "utf-8", timeout: 2000 }).trim();

    // Get memory info (Linux-specific)
    let memFree = "unknown";
    if (existsSync("/proc/meminfo")) {
      const meminfo = execSync("grep MemAvailable /proc/meminfo", {
        encoding: "utf-8",
        timeout: 2000,
      });
      const match = meminfo.match(/(\d+)/);
      if (match) {
        const memKB = Number.parseInt(match[1], 10);
        memFree = `${Math.round(memKB / 1024)} MB`;
      }
    }

    return { hostname, uptime, memFree };
  } catch (err) {
    logWarn(`Failed to get system info: ${err.message}`);
    return { hostname: "unknown", uptime: "unknown", memFree: "unknown" };
  }
}
