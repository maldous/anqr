// RTL smoke (E-R9 / S11). Loads the editor with ?lang=ar and asserts:
//   - <html dir="rtl"> is set
//   - the QR canvas still renders (no crash from font/script swap)
//
// Matches the `basic` Playwright project (testMatch /basic\..*\.spec\.ts/).
import { expect, test } from "@playwright/test";

const WELCOME_VERSION = "2026.05.24";

async function suppressWelcomeModal(page: import("@playwright/test").Page) {
  await page.addInitScript((version: string) => {
    localStorage.setItem("anqr-welcome-seen", version);
  }, WELCOME_VERSION);
}

test.describe("RTL locales", () => {
  test("?lang=ar sets html dir=rtl and renders the canvas", async ({ page }) => {
    await suppressWelcomeModal(page);
    await page.addInitScript(() => {
      // The language detector persists in localStorage under this key;
      // seeding it avoids any flash of LTR while detection runs.
      localStorage.setItem("anqr-language", "ar");
    });

    await page.goto("/?lang=ar");

    // Direction should land RTL — the loadFontForLanguage + isRtlLanguage
    // helpers both wire through to a document.documentElement.dir set.
    await page.waitForFunction(() => document.documentElement.dir === "rtl", {
      timeout: 10_000,
    });
    expect(await page.evaluate(() => document.documentElement.dir)).toBe("rtl");

    // Canvas must still render. Arabic font shaping has historically broken
    // initial paint if loadFontForLanguage throws on a missing chunk —
    // verify the QR canvas actually appeared.
    await page.waitForSelector('[data-testid="qr-preview"] canvas', {
      timeout: 15_000,
    });
    const dims = await page.evaluate(() => {
      const c = document.querySelector(
        '[data-testid="qr-preview"] canvas',
      ) as HTMLCanvasElement | null;
      return c ? { w: c.width, h: c.height } : null;
    });
    expect(dims).not.toBeNull();
    expect(dims?.w ?? 0).toBeGreaterThan(0);
    expect(dims?.h ?? 0).toBeGreaterThan(0);
  });
});
