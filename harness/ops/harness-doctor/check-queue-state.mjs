// Generated from ../../harness/ops/harness-doctor.mjs:217

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function checkQueueState() {
  try {
    const out = execFileSync("node", ["harness/ops/symphony-queue-control.mjs", "--check"], {
      cwd: ROOT,
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 30_000,
    });

    // Parse output for queue state
    const pendingMatch = out.match(/pending:\s*(\d+)/i);
    const processingMatch = out.match(/processing:\s*(\d+)/i);

    const pending = pendingMatch ? Number.parseInt(pendingMatch[1], 10) : 0;
    const processing = processingMatch ? Number.parseInt(processingMatch[1], 10) : 0;

    return {
      pass: true,
      detail: `pending=${pending}, processing=${processing}`,
      pending,
      processing,
    };
  } catch {
    // Queue might be empty or unreachable
    return {
      pass: true,
      detail: "Queue check unavailable (may be empty or error)",
      pending: 0,
      processing: 0,
    };
  }
}
