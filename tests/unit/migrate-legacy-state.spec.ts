import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "migrate-legacy-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const { migrateLegacyState } = await import(
  "../../harness/ops/core/symphony-shared-state/migrate-legacy-state.mjs"
);

const LEGACY_DIR = path.resolve(PROJECT_ROOT, "reports", "symphony");
const MARKER_PATH = path.join(TEST_STATE_DIR, "migrated-from-legacy");

const FILES_TO_MIGRATE = [
  "session-state.json",
  "provider-health.json",
  "provider-failures.json",
  "provider-stats.json",
  "provider-leases.json",
  "provider-probe-cache.json",
  "provider-probe-results.json",
];

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  // Clean up any test artifacts left in the legacy dir
  for (const fileName of FILES_TO_MIGRATE) {
    try {
      const f = path.join(LEGACY_DIR, fileName);
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {
      // ignore
    }
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("migrateLegacyState", () => {
  beforeEach(() => {
    // Ensure clean state directory
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
    fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
  });

  it("creates a marker file when no legacy directory exists", () => {
    migrateLegacyState();
    expect(fs.existsSync(MARKER_PATH)).toBe(true);
    const content = fs.readFileSync(MARKER_PATH, "utf-8");
    expect(content).toContain("migrated:");
  });

  it("is idempotent — second call is a no-op when marker exists", () => {
    migrateLegacyState();
    const firstContent = fs.readFileSync(MARKER_PATH, "utf-8");
    migrateLegacyState();
    const secondContent = fs.readFileSync(MARKER_PATH, "utf-8");
    expect(firstContent).toBe(secondContent);
  });

  it("copies files from legacy dir to bridge state dir", () => {
    // Create legacy directory with a test file
    fs.mkdirSync(LEGACY_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(LEGACY_DIR, "session-state.json"),
      JSON.stringify({ test: true })
    );

    try {
      migrateLegacyState();
      const dst = path.join(TEST_STATE_DIR, "session-state.json");
      expect(fs.existsSync(dst)).toBe(true);
      const content = JSON.parse(fs.readFileSync(dst, "utf-8"));
      expect(content.test).toBe(true);
    } finally {
      // Clean up legacy test file
      const legacyFile = path.join(LEGACY_DIR, "session-state.json");
      if (fs.existsSync(legacyFile)) fs.unlinkSync(legacyFile);
    }
  });

  it("does not overwrite existing files in bridge state dir", () => {
    // Create legacy directory
    fs.mkdirSync(LEGACY_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(LEGACY_DIR, "session-state.json"),
      JSON.stringify({ legacy: true })
    );

    // Pre-existing file in bridge state dir
    fs.writeFileSync(
      path.join(TEST_STATE_DIR, "session-state.json"),
      JSON.stringify({ existing: true })
    );

    try {
      migrateLegacyState();
      const content = JSON.parse(
        fs.readFileSync(path.join(TEST_STATE_DIR, "session-state.json"), "utf-8")
      );
      // Existing file should NOT be overwritten
      expect(content.existing).toBe(true);
      expect(content.legacy).toBeUndefined();
    } finally {
      const legacyFile = path.join(LEGACY_DIR, "session-state.json");
      if (fs.existsSync(legacyFile)) fs.unlinkSync(legacyFile);
    }
  });

  it("marker file contains migration summary", () => {
    fs.mkdirSync(LEGACY_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(LEGACY_DIR, "provider-health.json"),
      JSON.stringify({ ok: true })
    );

    try {
      migrateLegacyState();
      const content = fs.readFileSync(MARKER_PATH, "utf-8");
      expect(content).toMatch(/migrated: \d+ files? from/);
    } finally {
      const legacyFile = path.join(LEGACY_DIR, "provider-health.json");
      if (fs.existsSync(legacyFile)) fs.unlinkSync(legacyFile);
    }
  });
});
