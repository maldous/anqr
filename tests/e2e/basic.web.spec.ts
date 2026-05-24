import { expect, test } from "@playwright/test";

// SPA tier: load the generator, type a URL, confirm QR renders.
test("SPA: QR renders for a URL payload", async ({ page }) => {
  // Register a pre-navigation init script so the event listener survives the initial load.
  await page.addInitScript(() => {
    document.addEventListener(
      "anqr:render-complete",
      () => {
        (window as unknown as Record<string, unknown>).__anqrRendered = true;
      },
      { once: true },
    );
  });

  await page.goto("/");

  // The default payload type is URL — type into the URL input.
  const urlInput = page.getByTestId("payload-url-input");
  await urlInput.fill("https://example.com");

  // Wait for render-complete flag or fall back to canvas having non-zero width.
  await page.waitForFunction(() => {
    const rendered = (window as unknown as Record<string, unknown>).__anqrRendered;
    if (rendered) return true;
    const canvas = document.querySelector('[data-testid="qr-preview"] canvas') as HTMLCanvasElement | null;
    return canvas !== null && canvas.width > 0;
  }, { timeout: 15_000 });

  const canvas = page.locator('[data-testid="qr-preview"] canvas');
  await expect(canvas).toBeVisible();
  const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
  expect(width).toBeGreaterThan(0);
});

// API tier: /api/contract/qr returns JSON envelopes with base64-encoded image data.
test("API: /api/contract/qr returns PNG and SVG envelopes", async ({ request }) => {
  const png = await request.get(
    "/api/contract/qr?data=https%3A%2F%2Fexample.com&format=png&size=100",
  );
  expect(png.status()).toBe(200);
  const pngBody = await png.json();
  expect(pngBody.ok).toBe(true);
  expect(pngBody.data.mimeType).toBe("image/png");
  expect(typeof pngBody.data.content).toBe("string");

  const svg = await request.get(
    "/api/contract/qr?data=https%3A%2F%2Fexample.com&format=svg&size=100",
  );
  expect(svg.status()).toBe(200);
  const svgBody = await svg.json();
  expect(svgBody.ok).toBe(true);
  expect(svgBody.data.mimeType).toBe("image/svg+xml");
  // Decode base64 and confirm it's a real SVG.
  const svgText = Buffer.from(svgBody.data.content, "base64").toString("utf-8");
  expect(svgText).toContain("<svg");
});

// MCP tier: the /api/mcp endpoint responds to a JSON-RPC initialize handshake.
test("MCP: /api/mcp responds to initialize handshake", async ({ request }) => {
  const res = await request.post("/api/mcp", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "smoke-test", version: "0" },
      },
    },
  });
  // Accept 200 (JSON response) or 202 (SSE stream accepted).
  expect([200, 202]).toContain(res.status());
  const text = await res.text();
  // Must reference the MCP protocol version somewhere in the response.
  expect(text).toMatch(/2024-11-05|protocolVersion|serverInfo/);
});
