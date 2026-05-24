import { expect, test } from "@playwright/test";

// Matches WELCOME_VERSION in features/onboarding/components/welcome-modal.tsx.
// Bump when that constant changes so suppression keeps working.
const WELCOME_VERSION = "2026.05.24";

// Suppress the welcome modal for tests that aren't exercising it.
async function suppressWelcomeModal(page: import("@playwright/test").Page) {
  await page.addInitScript((version: string) => {
    localStorage.setItem("anqr-welcome-seen", version);
  }, WELCOME_VERSION);
}

// Wait for a QR render-complete event (set up before navigation).
async function armRenderComplete(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    document.addEventListener("anqr:render-complete", () => {
      (window as unknown as Record<string, unknown>).__anqrRendered = true;
    });
  });
}

async function waitForRender(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => {
      const rendered = (window as unknown as Record<string, unknown>).__anqrRendered;
      if (rendered) return true;
      const canvas = document.querySelector(
        '[data-testid="qr-preview"] canvas',
      ) as HTMLCanvasElement | null;
      return canvas !== null && canvas.width > 0;
    },
    { timeout: 15_000 },
  );
}

// ─── Welcome modal flow ───────────────────────────────────────────────────────

test.describe("Welcome modal", () => {
  test("appears on first visit, dismisses, persists across reload", async ({ page }) => {
    // No suppression script — fresh storage means the modal should appear.
    await page.goto("/");
    const getStarted = page.getByTestId("welcome-get-started");
    await expect(getStarted).toBeVisible({ timeout: 5_000 });

    // Dismiss and confirm localStorage was written.
    await getStarted.click();
    await expect(getStarted).toBeHidden({ timeout: 2_000 });
    const seen = await page.evaluate(() => localStorage.getItem("anqr-welcome-seen"));
    expect(seen).toBe(WELCOME_VERSION);

    // Reload — must not re-appear.
    await page.reload();
    await expect(page.getByTestId("welcome-get-started")).toBeHidden({ timeout: 2_000 });
  });
});

// ─── SPA tier ─────────────────────────────────────────────────────────────────

test.describe("SPA generator", () => {
  test.beforeEach(async ({ page }) => {
    await suppressWelcomeModal(page);
    await armRenderComplete(page);
  });

  test("QR renders for a URL payload", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("payload-url-input").fill("https://example.com");
    await waitForRender(page);

    const canvas = page.locator('[data-testid="qr-preview"] canvas');
    await expect(canvas).toBeVisible();
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(width).toBeGreaterThan(0);
  });

  test("switches payload type to plain text and renders", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("payload-content-type-select").click();
    // Shadcn renders options into a portal; click by accessible role + name.
    await page.getByRole("option", { name: /text|plain/i }).first().click();
    await page.getByTestId("payload-text-textarea").fill("Hello QR world");
    await waitForRender(page);

    const canvas = page.locator('[data-testid="qr-preview"] canvas');
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(width).toBeGreaterThan(0);
  });

  test("switches tier to Advanced and changes output format to SVG", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("payload-url-input").fill("https://example.com");
    await waitForRender(page);

    // Output section is only visible on the Advanced/Pro tier.
    await page.getByTestId("tier-tab-advanced").click();

    // Sidebar sections are collapsed accordions — expand the Output section first.
    const outputAccordion = page.locator('[data-testid="accordion-output"] button').first();
    await outputAccordion.scrollIntoViewIfNeeded();
    await outputAccordion.click();

    const formatTrigger = page.getByTestId("output-format-trigger");
    await expect(formatTrigger).toBeVisible({ timeout: 5_000 });
    await formatTrigger.click();
    await page.getByRole("option", { name: /SVG/i }).first().click();

    // After format switch, the format trigger should reflect SVG.
    await expect(formatTrigger).toContainText(/SVG/i);
  });
});

// ─── API tier — /api/contract/qr ──────────────────────────────────────────────

test.describe("API: /api/contract/qr", () => {
  test("PNG envelope: ok=true, mimeType=image/png, base64 content", async ({ request }) => {
    const res = await request.get(
      "/api/contract/qr?data=https%3A%2F%2Fexample.com&format=png&size=100",
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.mimeType).toBe("image/png");
    expect(typeof body.data.content).toBe("string");
    const png = Buffer.from(body.data.content, "base64");
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    expect(png.slice(0, 4).toString("hex")).toBe("89504e47");
  });

  test("SVG envelope: ok=true, mimeType=image/svg+xml, decoded body contains <svg", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/contract/qr?data=https%3A%2F%2Fexample.com&format=svg&size=100",
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.mimeType).toBe("image/svg+xml");
    const svg = Buffer.from(body.data.content, "base64").toString("utf-8");
    expect(svg).toContain("<svg");
    expect(svg).toContain("xmlns=");
  });

  test("invalid format param produces a structured error, not a 500", async ({ request }) => {
    const res = await request.get(
      "/api/contract/qr?data=hello&format=not-a-real-format&size=100",
    );
    // Should reject cleanly with 4xx, never crash with 5xx.
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── MCP tier — /api/mcp ──────────────────────────────────────────────────────

test.describe("API: /api/mcp", () => {
  test("initialize handshake returns protocol version", async ({ request }) => {
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
    expect([200, 202]).toContain(res.status());
    const text = await res.text();
    expect(text).toMatch(/2024-11-05|protocolVersion|serverInfo/);
  });

  test("tools/list returns a non-empty tool list", async ({ request }) => {
    const res = await request.post("/api/mcp", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      data: {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      },
    });
    expect([200, 202]).toContain(res.status());
    const text = await res.text();
    // Either SSE-wrapped or direct JSON — must mention at least one of the standard MCP tool keys.
    expect(text).toMatch(/"name"\s*:\s*"[^"]+"/);
  });
});
