import { SYMPHONY_BASE_URL, SYMPHONY_API_KEY } from "./config";

export async function sendCompletion(
  route: string,
  prompt: string = "Say hello in one word.",
): Promise<{ status: number; data: Record<string, unknown>; elapsed: number }> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYMPHONY_API_KEY}`,
      },
      body: JSON.stringify({
        model: route,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const data = await res.json();
    return { status: res.status, data, elapsed: Date.now() - startTime };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      data: { error: { message: `fetch failed: ${msg}` } },
      elapsed: Date.now() - startTime,
    };
  }
}
