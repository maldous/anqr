// Render-permutation safety net (E-R3 / S1).
//
// For a representative grid of (module style × dither family × animation
// pattern) the editor must render a non-empty QR canvas without errors.
// This catches the class of bugs where a render-pipeline change breaks
// scannability for some style combination but doesn't surface on the
// default settings the basic.web spec covers.
//
// Asserts: canvas exists with non-zero dimensions, no
// "anqr:render-error" custom event fires, and the canvas.toDataURL
// hash matches the committed baseline (when ANQR_SNAPSHOT_PERMUTATIONS=1
// is set). The hash assertion is opt-in until we've measured pixel
// stability across the CI matrix — by default the test only asserts
// "renders SOMETHING non-empty"; with the env var on, drift triggers a
// failure with both hashes in the message.
//
// To bake/refresh baselines on a known-clean run:
//   ANQR_SNAPSHOT_PERMUTATIONS=record npx playwright test --project permutations
// On rerun:
//   ANQR_SNAPSHOT_PERMUTATIONS=1 npx playwright test --project permutations
//
// Matches the existing `permutations` Playwright project pattern.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

// ESM equivalent of __dirname — Playwright runs this spec under ESM and
// the bare __dirname is undefined there. Compute from import.meta.url.
const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);
const SNAPSHOT_DIR = join(__dirname_, "__snapshots__", "permutations");
const SNAPSHOT_MODE = process.env.ANQR_SNAPSHOT_PERMUTATIONS ?? "off";

const WELCOME_VERSION = "2026.05.24.2";

async function bootstrap(page: import("@playwright/test").Page) {
  await page.addInitScript((version: string) => {
    localStorage.setItem("anqr-welcome-seen", version);
    localStorage.setItem("anqr-language", "en-GB");
  }, WELCOME_VERSION);
  await page.addInitScript(() => {
    document.addEventListener("anqr:render-complete", () => {
      (globalThis as unknown as Record<string, unknown>).__anqrRendered = true;
    });
    document.addEventListener("anqr:render-error", (e) => {
      (globalThis as unknown as Record<string, unknown>).__anqrRenderError =
        (e as CustomEvent).detail ?? "render-error";
    });
  });
}

async function waitForInitialRender(page: import("@playwright/test").Page) {
  // Wait for the editor to fully boot once per test. The
  // `anqr:render-complete` event fires reliably here because the very
  // first render does transition through non-idle.
  await page.waitForFunction(
    () => (globalThis as unknown as Record<string, unknown>).__anqrRendered === true,
    { timeout: 20_000 },
  );
}

async function waitForStateSettle(page: import("@playwright/test").Page) {
  // After applyCombo, the canvas updates synchronously inside React's
  // commit phase. Fast static-QR re-renders don't always transition
  // through the "busy" state that gates the render-complete event, so
  // we can't rely on it for in-test state changes. Poll the canvas
  // dataURL hash until it stabilizes (two consecutive identical
  // captures), with a hard ceiling. That's the most reliable signal
  // that "whatever this combo renders, it's done".
  await page.waitForFunction(
    () => {
      const w = globalThis as unknown as { __anqrLastHash?: string; __anqrStableSince?: number };
      const c = document.querySelector(
        '[data-testid="qr-preview"] canvas',
      ) as HTMLCanvasElement | null;
      if (!c) return false;
      // SubtleCrypto is async; cheap djb2 here is enough — we're
      // looking for "did this string change between polls".
      const data = c.toDataURL("image/png");
      let h = 5381;
      for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) | 0;
      const hash = h.toString(16);
      if (w.__anqrLastHash === hash) {
        if (!w.__anqrStableSince) w.__anqrStableSince = Date.now();
        // Wait for 800ms of hash stability. The worker pipeline + frame
        // raf can take a few hundred ms to actually update the visible
        // canvas after a store mutation; shorter windows captured
        // mid-React-commit and missed the new style.
        return Date.now() - w.__anqrStableSince > 800;
      }
      w.__anqrLastHash = hash;
      w.__anqrStableSince = 0;
      return false;
    },
    { timeout: 15_000, polling: 200 },
  );
}

async function resetSettleState(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const w = globalThis as unknown as { __anqrLastHash?: string; __anqrStableSince?: number };
    w.__anqrLastHash = "";
    w.__anqrStableSince = 0;
  });
}

// Setters that exist on QRState — see apps/web/src/state/qr-store.ts.
interface StoreLike {
  setTier?: (s: string) => void;
  setRenderModuleStyle?: (s: string) => void;
  setRenderFinderStyle?: (s: string) => void;
}

async function applyCombo(
  page: import("@playwright/test").Page,
  combo: { moduleStyle: string; finderStyle: string },
) {
  await page.evaluate((c) => {
    const w = globalThis as unknown as {
      __anqrRendered?: boolean;
      useQRStore?: { getState(): StoreLike };
    };
    w.__anqrRendered = false;
    const store = w.useQRStore?.getState?.();
    if (!store) return;
    store.setTier?.("professional");
    // Set to a different state first so the target assignment always
    // triggers a real state change (and therefore a render-complete
    // event). Otherwise setting square+square when the default is
    // square+square is a no-op and the test hangs on waitForRender.
    store.setRenderModuleStyle?.(c.moduleStyle === "square" ? "rounded" : "square");
    store.setRenderFinderStyle?.(c.finderStyle === "square" ? "rounded" : "square");
    // Now apply the target.
    store.setRenderModuleStyle?.(c.moduleStyle);
    store.setRenderFinderStyle?.(c.finderStyle);
  }, combo);
}

const MODULE_STYLES = ["square", "rounded", "dots", "diamond", "connected"];
const FINDER_STYLES = ["square", "rounded", "dots"];

// Pick a representative slice: every module × every finder style.
// 5 × 3 = 15 combos. Dither and animation permutations require an
// overlay/animation pre-state we don't want to bake into this spec
// (they'd need a fixture image + extra setters); module × finder
// already exercises the bulk of the render-cell-decision paths.
const COMBOS: Array<{ moduleStyle: string; finderStyle: string }> = [];
for (const ms of MODULE_STYLES) {
  for (const fs of FINDER_STYLES) {
    COMBOS.push({ moduleStyle: ms, finderStyle: fs });
  }
}

test.describe("Render permutations", () => {
  for (const combo of COMBOS) {
    const label = `${combo.moduleStyle}+${combo.finderStyle}`;
    test(`renders a non-empty QR canvas: ${label}`, async ({ page }) => {
      await bootstrap(page);
      await page.goto("/");

      // Wait for the store to land on window — the app exposes it for
      // debugging and the welcome-modal flow uses it. If the global
      // isn't there (build trimmed it), skip cleanly — better than a
      // silent pass.
      const hasStore = await page.evaluate(
        () => typeof (globalThis as unknown as { useQRStore?: unknown }).useQRStore === "function",
      );
      if (!hasStore) {
        test.skip();
        return;
      }

      await waitForInitialRender(page);
      await resetSettleState(page);
      await applyCombo(page, combo);
      await waitForStateSettle(page);

      const renderError = await page.evaluate(
        () => (globalThis as unknown as { __anqrRenderError?: string }).__anqrRenderError,
      );
      expect(renderError, `render-error event fired for ${label}`).toBeFalsy();

      const dims = await page.evaluate(() => {
        const c = document.querySelector(
          '[data-testid="qr-preview"] canvas',
        ) as HTMLCanvasElement | null;
        return c ? { w: c.width, h: c.height } : null;
      });
      expect(dims, `canvas missing for ${label}`).not.toBeNull();
      expect(dims?.w ?? 0).toBeGreaterThan(0);
      expect(dims?.h ?? 0).toBeGreaterThan(0);

      // Snapshot comparison (opt-in via ANQR_SNAPSHOT_PERMUTATIONS).
      // `off` skips the hash assertion entirely (default — keeps CI
      //   stable across machines until baselines are agreed).
      // `record` writes the current hash to the baseline file.
      // anything else (e.g. `1`) compares against the existing baseline
      //   and fails on drift.
      if (SNAPSHOT_MODE === "off") return;

      const dataUrl = await page.evaluate(() => {
        const c = document.querySelector(
          '[data-testid="qr-preview"] canvas',
        ) as HTMLCanvasElement | null;
        return c ? c.toDataURL("image/png") : null;
      });
      expect(dataUrl).not.toBeNull();
      const hash = createHash("sha256").update(dataUrl ?? "").digest("hex");

      const safeLabel = label.replace(/[^a-zA-Z0-9_+-]/g, "_");
      const baselinePath = join(SNAPSHOT_DIR, `${safeLabel}.sha256.txt`);
      if (SNAPSHOT_MODE === "record") {
        mkdirSync(dirname(baselinePath), { recursive: true });
        writeFileSync(baselinePath, `${hash}\n`, "utf8");
        return;
      }
      if (!existsSync(baselinePath)) {
        throw new Error(
          `Missing baseline for ${label}. Run with ANQR_SNAPSHOT_PERMUTATIONS=record to bake.`,
        );
      }
      const baseline = readFileSync(baselinePath, "utf8").trim();
      expect(hash, `visual drift detected for ${label}`).toBe(baseline);
    });
  }
});
