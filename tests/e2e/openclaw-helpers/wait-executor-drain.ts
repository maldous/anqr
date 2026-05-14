import { execFileSync } from "node:child_process";
import { SYMPHONY_EXECUTOR_URL, SYMPHONY_API_KEY } from "./config";

async function getExecutorCount(): Promise<number> {
  try {
    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/v1/stats`, {
      headers: { Authorization: `Bearer ${SYMPHONY_API_KEY}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (res.ok) {
      const data = (await res.json()) as { concurrentRequests?: { count?: number } };
      return data.concurrentRequests?.count ?? 0;
    }
  } catch {
    /* unreachable */
  }
  return 0;
}

/**
 * Wait for the executor to have fewer than maxActive concurrent requests.
 * If it cannot drain within timeoutMs, restarts executor @1 to clear stuck requests.
 */
export async function waitExecutorDrain(maxActive = 5, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const count = await getExecutorCount();
    if (count < maxActive) return;
    await new Promise((r) => setTimeout(r, 3_000));
  }
  // Timed out — restart executor 1 to clear stuck requests
  try {
    execFileSync("systemctl", ["--user", "restart", "anqr-symphony-executor@1.service"], {
      timeout: 10_000,
    });
    // Give the executor time to start back up
    await new Promise((r) => setTimeout(r, 5_000));
  } catch {
    /* best-effort restart */
  }
}
