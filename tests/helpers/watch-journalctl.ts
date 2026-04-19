/**
 * Helper to monitor journalctl logs during integration tests.
 *
 * Spawns a journalctl process for the specified systemd user service unit,
 * collects output, and provides methods to search/filter/summarize the logs.
 * Uses `--since` to avoid pulling in old logs from previous test runs.
 */

import { spawn, execSync, type ChildProcess } from "node:child_process";

/** Check if journalctl and systemd are available */
export function isJournalctlAvailable(): boolean {
  try {
    execSync("which journalctl", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export interface JournalctlOptions {
  /** Systemd user service unit name, e.g. "anqr-symphony-codex.service" */
  unit: string;
  /** Start time — any journalctl --since value (default: "1 min ago") */
  since?: string;
  /** Extra journalctl flags */
  extraFlags?: string[];
}

export interface JournalctlWatcher {
  /** Stop collecting logs and return the full collected output */
  stop(): string;
  /** Get current collected output without stopping */
  getOutput(): string;
  /** Search collected output for a pattern */
  grep(pattern: string | RegExp): string[];
  /** Check if a pattern appears in the collected output */
  has(pattern: string | RegExp): boolean;
  /** The spawned journalctl process (for cleanup) */
  process: ChildProcess | null;
}

/**
 * Start watching journalctl logs for a service unit.
 *
 * Returns a watcher object that collects logs in the background.
 * Call `watcher.stop()` to terminate the journalctl process and
 * get the full collected output.
 */
export function watchJournalctl(options: JournalctlOptions): JournalctlWatcher {
  const { unit, since = "1 min ago", extraFlags = [] } = options;

  let output = "";
  let proc: ChildProcess | null = null;

  try {
    const args = [
      "--user",
      "-u", unit,
      "--since", since,
      "--no-pager",
      "--output=short-precise",
      ...extraFlags,
    ];

    proc = spawn("journalctl", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.stderr?.on("data", () => {
      // Ignore stderr — journalctl may output warnings to stderr
    });

    proc.on("error", () => {
      // Process spawn error — ignore, output will just be empty
    });
  } catch {
    // journalctl not available — watcher will return empty output
  }

  return {
    process: proc,
    getOutput: () => output,
    stop: () => {
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
        setTimeout(() => {
          if (proc && !proc.killed) proc.kill("SIGKILL");
        }, 2000);
      }
      return output;
    },
    grep: (pattern: string | RegExp) => {
      const regex = typeof pattern === "string" ? new RegExp(pattern, "gi") : pattern;
      return output.split("\n").filter((line) => regex.test(line));
    },
    has: (pattern: string | RegExp) => {
      const regex = typeof pattern === "string" ? new RegExp(pattern, "gi") : pattern;
      return regex.test(output);
    },
  };
}

/**
 * One-shot: fetch recent journalctl logs for a unit and return them.
 * Useful for post-test log inspection without a background watcher.
 */
export function fetchJournalctlLogs(
  unit: string,
  since = "5 min ago",
): string {
  try {
    return execSync(
      `journalctl --user -u ${unit} --since '${since}' --no-pager --output=short-precise 2>/dev/null`,
      { encoding: "utf-8", timeout: 10_000 },
    );
  } catch {
    return "";
  }
}
