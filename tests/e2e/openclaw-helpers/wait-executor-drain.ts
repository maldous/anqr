import { SYMPHONY_EXECUTOR_URL, SYMPHONY_API_KEY } from "./config";

/**
 * Wait for the executor to have fewer than maxActive concurrent requests.
 * When cascade tests leave stuck server-side requests, this ensures
 * subsequent tests don't immediately hit the 8-slot concurrency limit.
 */
export async function waitExecutorDrain(maxActive = 5, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/v1/stats`, {
        headers: { Authorization: `Bearer ${SYMPHONY_API_KEY}` },
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const data = (await res.json()) as { concurrentRequests?: { count?: number } };
        const count = data.concurrentRequests?.count ?? 0;
        if (count < maxActive) return;
      }
    } catch {
      /* executor unreachable — not a reason to abort the wait */
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
}
