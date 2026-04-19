/**
 * Shared helper to poll the bridge /v1/providers endpoint until
 * at least `minAvailable` providers are available.
 */

export async function waitForProviders(
  baseUrl: string,
  apiKey: string,
  minAvailable = 1,
  timeoutMs = 60_000,
): Promise<number> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/v1/providers`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = (await res.json()) as { available: number };
        if (data.available >= minAvailable) return data.available;
      } else if (res.status === 404) {
        console.log(`[waitForProviders] Got 404 from /v1/providers — endpoint may not exist`);
      } else {
        console.log(`[waitForProviders] Got ${res.status} from /v1/providers`);
      }
    } catch {
      // bridge not ready or probe in progress
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return 0;
}
