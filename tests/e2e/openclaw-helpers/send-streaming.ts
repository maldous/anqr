import { SYMPHONY_BASE_URL, SYMPHONY_API_KEY } from "./config";

export async function sendStreamingCompletion(
  route: string,
  prompt: string = "Count from 1 to 3.",
  baseUrl: string = SYMPHONY_BASE_URL,
  apiKey: string = SYMPHONY_API_KEY,
): Promise<{
  status: number;
  chunks: string[];
  content: string;
  elapsed: number;
  contentType: string | null;
  errMsg: string;
}> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: route,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = res.headers.get("content-type");

    if (res.status !== 200) {
      const body = await res.text().catch(() => "");
      let errMsg = "";
      try {
        errMsg = JSON.parse(body).error?.message ?? "";
      } catch {
        errMsg = body.slice(0, 200);
      }
      return {
        status: res.status,
        chunks: [],
        content: "",
        elapsed: Date.now() - startTime,
        contentType,
        errMsg,
      };
    }

    const chunks: string[] = [];
    let content = "";
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let doneReading = false;

    if (reader) {
      while (!doneReading) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") {
            chunks.push("[DONE]");
            doneReading = true;
            break;
          }
          if (!data.trim()) continue;
          chunks.push(data);
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) content += delta;
          } catch {
            /* non-JSON chunk */
          }
        }
      }
    }

    return {
      status: res.status,
      chunks,
      content,
      elapsed: Date.now() - startTime,
      contentType,
      errMsg: "",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      chunks: [],
      content: "",
      elapsed: Date.now() - startTime,
      contentType: null,
      errMsg: `fetch failed: ${msg}`,
    };
  }
}
