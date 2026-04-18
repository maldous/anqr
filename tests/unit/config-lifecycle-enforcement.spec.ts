import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import path from "node:path";
import fs from "node:fs";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// Result shapes for harness-doctor modules (JS sources — typed here for tests)
// ---------------------------------------------------------------------------

interface EnvConfigValidateResult {
  pass: boolean;
  templateKeyCount: number;
  surfaces: Array<{ missingKeys: string[]; exists: boolean; extraKeys?: string[] }>;
  detail?: string;
}

interface EnvConfigGenerateResult {
  actions: string[];
}

interface ServiceLifecycleResult {
  criticalIssues: string[];
  advisoryIssues: string[];
  issues: string[];
}

interface PreflightResult {
  pass: boolean;
  detail: string;
}

// ---------------------------------------------------------------------------
// 1. generateEnvConfig — validate mode (runtime behavior)
// ---------------------------------------------------------------------------

describe("generateEnvConfig — validate mode", () => {
  let tmpDir: string;
  let generateEnvConfig: (opts?: Record<string, unknown>) => Promise<EnvConfigValidateResult>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-env-config-validate-"));
    const mod = await import("../../harness/ops/harness-doctor/generate-env-config.mjs");
    generateEnvConfig = mod.generateEnvConfig;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("passes when all surfaces have all template keys", async () => {
    const template = join(tmpDir, "template-aligned.env");
    writeFileSync(template, "KEY_A=\nKEY_B=\nKEY_C=\n");

    const surface = join(tmpDir, "surface-aligned.env");
    writeFileSync(surface, "KEY_A=val1\nKEY_B=val2\nKEY_C=val3\n");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: template,
      surfaces: [{ name: "test", path: surface }],
    });

    expect(result.pass).toBe(true);
    expect(result.templateKeyCount).toBe(3);
    expect(result.surfaces[0].missingKeys).toHaveLength(0);
    expect(result.surfaces[0].exists).toBe(true);
  });

  it("fails when surface is missing keys from template", async () => {
    const template = join(tmpDir, "template-missing.env");
    writeFileSync(template, "KEY_A=\nKEY_B=\nKEY_C=\nKEY_D=\n");

    const surface = join(tmpDir, "surface-missing.env");
    writeFileSync(surface, "KEY_A=val1\nKEY_B=val2\n");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: template,
      surfaces: [{ name: "test", path: surface }],
    });

    expect(result.pass).toBe(false);
    expect(result.surfaces[0].missingKeys).toContain("KEY_C");
    expect(result.surfaces[0].missingKeys).toContain("KEY_D");
    expect(result.surfaces[0].missingKeys).toHaveLength(2);
  });

  it("reports extra keys in surface without failing", async () => {
    const template = join(tmpDir, "template-extra.env");
    writeFileSync(template, "KEY_A=\n");

    const surface = join(tmpDir, "surface-extra.env");
    writeFileSync(surface, "KEY_A=val1\nEXTRA_KEY=val2\n");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: template,
      surfaces: [{ name: "test", path: surface }],
    });

    expect(result.pass).toBe(true);
    expect(result.surfaces[0].extraKeys).toContain("EXTRA_KEY");
  });

  it("fails when surface file does not exist", async () => {
    const template = join(tmpDir, "template-nofile.env");
    writeFileSync(template, "KEY_A=\n");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: template,
      surfaces: [{ name: "missing", path: join(tmpDir, "nonexistent.env") }],
    });

    expect(result.pass).toBe(false);
    expect(result.surfaces[0].exists).toBe(false);
  });

  it("fails when template file does not exist", async () => {
    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: join(tmpDir, "no-template.env"),
      surfaces: [],
    });

    expect(result.pass).toBe(false);
    expect(result.detail).toContain("template missing");
  });

  it("validates multiple surfaces independently", async () => {
    const template = join(tmpDir, "template-multi.env");
    writeFileSync(template, "KEY_A=\nKEY_B=\n");

    const good = join(tmpDir, "surface-good.env");
    writeFileSync(good, "KEY_A=x\nKEY_B=y\n");

    const bad = join(tmpDir, "surface-bad.env");
    writeFileSync(bad, "KEY_A=x\n");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath: template,
      surfaces: [
        { name: "good", path: good },
        { name: "bad", path: bad },
      ],
    });

    expect(result.pass).toBe(false);
    expect(result.surfaces[0].missingKeys).toHaveLength(0);
    expect(result.surfaces[1].missingKeys).toContain("KEY_B");
  });
});

// ---------------------------------------------------------------------------
// 2. generateEnvConfig — generate mode (runtime behavior)
// ---------------------------------------------------------------------------

describe("generateEnvConfig — generate mode", () => {
  let tmpDir: string;
  let generateEnvConfig: (opts?: Record<string, unknown>) => Promise<EnvConfigGenerateResult>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-env-config-generate-"));
    const mod = await import("../../harness/ops/harness-doctor/generate-env-config.mjs");
    generateEnvConfig = mod.generateEnvConfig;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates missing surface file with all template keys", async () => {
    const template = join(tmpDir, "template-gen.env");
    writeFileSync(template, "ALPHA=\nBRAVO=\nCHARLIE=\n");

    const surfacePath = join(tmpDir, "generated-new.env");
    expect(existsSync(surfacePath)).toBe(false);

    const result = await generateEnvConfig({
      mode: "generate",
      templatePath: template,
      surfaces: [{ name: "new", path: surfacePath }],
    });

    expect(existsSync(surfacePath)).toBe(true);
    const content = readFileSync(surfacePath, "utf-8");
    expect(content).toContain("ALPHA=");
    expect(content).toContain("BRAVO=");
    expect(content).toContain("CHARLIE=");
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions[0]).toContain("Created");
  });

  it("appends missing keys to existing surface file", async () => {
    const template = join(tmpDir, "template-append.env");
    writeFileSync(template, "KEY_X=\nKEY_Y=\nKEY_Z=\n");

    const surfacePath = join(tmpDir, "surface-append.env");
    writeFileSync(surfacePath, "KEY_X=existing_value\n");

    await generateEnvConfig({
      mode: "generate",
      templatePath: template,
      surfaces: [{ name: "append", path: surfacePath }],
    });

    const content = readFileSync(surfacePath, "utf-8");
    expect(content).toContain("KEY_X=existing_value");
    expect(content).toContain("KEY_Y=");
    expect(content).toContain("KEY_Z=");
    expect(content).toContain("auto-generated");
  });

  it("dryRun reports changes without writing", async () => {
    const template = join(tmpDir, "template-dry.env");
    writeFileSync(template, "DRY_KEY=\n");

    const surfacePath = join(tmpDir, "dry-run-surface.env");
    expect(existsSync(surfacePath)).toBe(false);

    const result = await generateEnvConfig({
      mode: "generate",
      templatePath: template,
      surfaces: [{ name: "dry", path: surfacePath }],
      dryRun: true,
    });

    expect(existsSync(surfacePath)).toBe(false);
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions[0]).toContain("Would create");
  });
});

// ---------------------------------------------------------------------------
// 3. checkServiceLifecycle — enforce mode (runtime behavior)
// ---------------------------------------------------------------------------

describe("checkServiceLifecycle — enforce mode", () => {
  let tmpDir: string;
  let checkServiceLifecycle: (opts?: Record<string, unknown>) => Promise<ServiceLifecycleResult>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-lifecycle-enforce-"));
    const mod = await import("../../harness/ops/harness-doctor/check-service-lifecycle.mjs");
    checkServiceLifecycle = mod.checkServiceLifecycle;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function createServicesDir(name: string, files: Record<string, string>) {
    const dir = join(tmpDir, name);
    mkdirSync(dir, { recursive: true });
    mkdirSync(join(dir, "default.target.wants"), { recursive: true });
    for (const [filename, content] of Object.entries(files)) {
      writeFileSync(join(dir, filename), content);
    }
    return dir;
  }

  it("passes for well-configured services", async () => {
    const dir = createServicesDir("good", {
      "anqr-symphony-router.service":
        "[Service]\nEnvironmentFile=%h/.config/systemd/user/anqr-ops.env\nRestart=on-failure\n",
      "anqr-discord-router.service":
        "[Service]\nEnvironmentFile=%h/.config/systemd/user/anqr-ops.env\nRestart=on-failure\n",
      "anqr-linear-webhook.service":
        "[Service]\nEnvironmentFile=%h/.config/systemd/user/anqr-ops.env\nRestart=on-failure\n",
      "anqr-symphony-executor@.service":
        "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
      "anqr-symphony-codex.service":
        "[Service]\nEnvironment=BRIDGE_MODE=control-plane\nRestart=on-failure\n",
    });

    const result = await checkServiceLifecycle({
      enforce: true,
      servicesDir: dir,
      wantsDir: join(dir, "default.target.wants"),
    });

    expect(result.criticalIssues).toHaveLength(0);
  });

  it("THROWS in enforce mode when EnvironmentFile uses optional dash", async () => {
    const dir = createServicesDir("bad-envfile", {
      "anqr-symphony-router.service":
        "[Service]\nEnvironmentFile=-%h/.config/systemd/user/anqr-ops.env\nRestart=on-failure\n",
    });

    await expect(
      checkServiceLifecycle({
        enforce: true,
        servicesDir: dir,
        wantsDir: join(dir, "default.target.wants"),
      }),
    ).rejects.toThrow("optional EnvironmentFile=-");
  });

  it("THROWS in enforce mode when BRIDGE_MODE is wrong", async () => {
    const dir = createServicesDir("bad-bridge", {
      "anqr-symphony-executor@.service": "[Service]\nEnvironment=BRIDGE_MODE=control-plane\n",
    });

    await expect(
      checkServiceLifecycle({
        enforce: true,
        servicesDir: dir,
        wantsDir: join(dir, "default.target.wants"),
      }),
    ).rejects.toThrow("BRIDGE_MODE=worktree");
  });

  it("THROWS in enforce mode when dependency chain is broken", async () => {
    const dir = createServicesDir("bad-dep", {
      "my-service.service":
        "[Unit]\nRequires=nonexistent-dependency.service\n[Service]\nRestart=on-failure\n",
    });

    await expect(
      checkServiceLifecycle({
        enforce: true,
        servicesDir: dir,
        wantsDir: join(dir, "default.target.wants"),
      }),
    ).rejects.toThrow("nonexistent-dependency.service");
  });

  it("does NOT throw for advisory issues when enforce=true", async () => {
    // Advisory: missing Restart= on a long-running service
    const dir = createServicesDir("advisory-only", {
      "anqr-watchdog.service": "[Service]\nExecStart=/bin/true\n",
      "anqr-symphony-executor@.service":
        "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
    });

    const result = await checkServiceLifecycle({
      enforce: true,
      servicesDir: dir,
      wantsDir: join(dir, "default.target.wants"),
    });

    expect(result.advisoryIssues.length).toBeGreaterThan(0);
    expect(result.criticalIssues).toHaveLength(0);
  });

  it("returns separate criticalIssues and advisoryIssues arrays", async () => {
    const dir = createServicesDir("mixed", {
      "anqr-symphony-router.service":
        "[Service]\nEnvironmentFile=-%h/.config/systemd/user/anqr-ops.env\n",
      "anqr-watchdog.service": "[Service]\nExecStart=/bin/true\n",
      "anqr-symphony-executor@.service":
        "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
    });

    const result = await checkServiceLifecycle({
      enforce: false,
      servicesDir: dir,
      wantsDir: join(dir, "default.target.wants"),
    });

    expect(result.criticalIssues.length).toBeGreaterThan(0);
    expect(result.advisoryIssues.length).toBeGreaterThan(0);
    expect(result.issues).toEqual([...result.criticalIssues, ...result.advisoryIssues]);
  });
});

// ---------------------------------------------------------------------------
// 4. Timer overlap detection (runtime behavior)
// ---------------------------------------------------------------------------

describe("Timer overlap detection", () => {
  let tmpDir: string;
  let validateTimerSchedules: (dir: string) => string[];

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-timer-overlap-"));
    const mod = await import("../../harness/ops/harness-doctor/validate-timer-schedules.mjs");
    validateTimerSchedules = mod.validateTimerSchedules;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("no issues for well-spaced timers", () => {
    const dir = join(tmpDir, "good-timers");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "nightly.timer"), "[Timer]\nOnCalendar=*-*-* 02:00:00\n");
    writeFileSync(join(dir, "export.timer"), "[Timer]\nOnCalendar=*-*-* 02:30:00\n");
    writeFileSync(join(dir, "rebuild.timer"), "[Timer]\nOnCalendar=*-*-* 03:00:00\n");

    const issues = validateTimerSchedules(dir);
    expect(issues).toHaveLength(0);
  });

  it("detects overlap when timers are too close", () => {
    const dir = join(tmpDir, "close-timers");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "first.timer"), "[Timer]\nOnCalendar=*-*-* 02:00:00\n");
    writeFileSync(join(dir, "second.timer"), "[Timer]\nOnCalendar=*-*-* 02:05:00\n");

    const issues = validateTimerSchedules(dir);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("overlap risk");
    expect(issues[0]).toContain("5min apart");
  });

  it("ignores interval-based timers (OnUnitActiveSec)", () => {
    const dir = join(tmpDir, "interval-timers");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "health.timer"), "[Timer]\nOnBootSec=60\nOnUnitActiveSec=300\n");

    const issues = validateTimerSchedules(dir);
    expect(issues).toHaveLength(0);
  });

  it("handles single calendar timer without issues", () => {
    const dir = join(tmpDir, "single-timer");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "only.timer"), "[Timer]\nOnCalendar=*-*-* 04:00:00\n");

    const issues = validateTimerSchedules(dir);
    expect(issues).toHaveLength(0);
  });

  it("detects zero-gap (same time) timers", () => {
    const dir = join(tmpDir, "same-time");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "alpha.timer"), "[Timer]\nOnCalendar=*-*-* 01:00:00\n");
    writeFileSync(join(dir, "beta.timer"), "[Timer]\nOnCalendar=*-*-* 01:00:00\n");

    const issues = validateTimerSchedules(dir);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("0min apart");
  });
});

// ---------------------------------------------------------------------------
// 5. Dependency chain validation (runtime behavior)
// ---------------------------------------------------------------------------

describe("Dependency chain validation", () => {
  let tmpDir: string;
  let validateDependencyChains: (dir: string) => string[];

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-dep-chain-"));
    const mod = await import("../../harness/ops/harness-doctor/validate-dependency-chains.mjs");
    validateDependencyChains = mod.validateDependencyChains;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("passes when all Requires= targets exist", () => {
    const dir = join(tmpDir, "good-deps");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "reconciler.service"),
      "[Unit]\nRequires=router.service\n[Service]\nExecStart=/bin/true\n",
    );
    writeFileSync(join(dir, "router.service"), "[Service]\nExecStart=/bin/true\n");

    const issues = validateDependencyChains(dir);
    expect(issues).toHaveLength(0);
  });

  it("reports missing Requires= target", () => {
    const dir = join(tmpDir, "bad-deps");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "my-service.service"),
      "[Unit]\nRequires=ghost.service\n[Service]\nExecStart=/bin/true\n",
    );

    const issues = validateDependencyChains(dir);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("ghost.service");
    expect(issues[0]).toContain("not found");
  });

  it("skips systemd built-in targets", () => {
    const dir = join(tmpDir, "builtin-deps");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "my-service.service"),
      "[Unit]\nRequires=network-online.target\n[Service]\nExecStart=/bin/true\n",
    );

    const issues = validateDependencyChains(dir);
    expect(issues).toHaveLength(0);
  });

  it("resolves template instances to template units", () => {
    const dir = join(tmpDir, "template-deps");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "depends-on-executor.service"),
      "[Unit]\nRequires=executor@1.service\n[Service]\nExecStart=/bin/true\n",
    );
    writeFileSync(join(dir, "executor@.service"), "[Service]\nExecStart=/bin/true\n");

    const issues = validateDependencyChains(dir);
    expect(issues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. enforceConfigPreflight — combined enforcement (runtime behavior)
// ---------------------------------------------------------------------------

describe("enforceConfigPreflight", () => {
  let tmpDir: string;
  let enforceConfigPreflight: (opts?: Record<string, unknown>) => Promise<PreflightResult>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-preflight-"));
    const mod = await import("../../harness/ops/harness-doctor/enforce-config-preflight.mjs");
    enforceConfigPreflight = mod.enforceConfigPreflight;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("passes when config and lifecycle are both clean", async () => {
    // Create aligned template + surface
    const template = join(tmpDir, "pass-template.env");
    writeFileSync(template, "KEY=\n");
    const surface = join(tmpDir, "pass-surface.env");
    writeFileSync(surface, "KEY=value\n");

    // Create valid services dir
    const svcDir = join(tmpDir, "pass-services");
    mkdirSync(svcDir, { recursive: true });
    mkdirSync(join(svcDir, "default.target.wants"), { recursive: true });
    writeFileSync(
      join(svcDir, "anqr-symphony-executor@.service"),
      "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
    );

    const result = await enforceConfigPreflight({
      templatePath: template,
      surfaces: [{ name: "test", path: surface }],
      servicesDir: svcDir,
      wantsDir: join(svcDir, "default.target.wants"),
    });

    expect(result.pass).toBe(true);
    expect(result.detail).toContain("passed");
  });

  it("THROWS when config surfaces are drifted", async () => {
    const template = join(tmpDir, "drift-template.env");
    writeFileSync(template, "KEY_A=\nKEY_B=\n");
    const surface = join(tmpDir, "drift-surface.env");
    writeFileSync(surface, "KEY_A=val\n"); // missing KEY_B

    const svcDir = join(tmpDir, "drift-services");
    mkdirSync(svcDir, { recursive: true });
    mkdirSync(join(svcDir, "default.target.wants"), { recursive: true });
    writeFileSync(
      join(svcDir, "anqr-symphony-executor@.service"),
      "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
    );

    await expect(
      enforceConfigPreflight({
        templatePath: template,
        surfaces: [{ name: "test", path: surface }],
        servicesDir: svcDir,
        wantsDir: join(svcDir, "default.target.wants"),
      }),
    ).rejects.toThrow("Config preflight failed");
  });

  it("THROWS when lifecycle has critical violations", async () => {
    const template = join(tmpDir, "lc-template.env");
    writeFileSync(template, "KEY=\n");
    const surface = join(tmpDir, "lc-surface.env");
    writeFileSync(surface, "KEY=val\n");

    const svcDir = join(tmpDir, "lc-services");
    mkdirSync(svcDir, { recursive: true });
    mkdirSync(join(svcDir, "default.target.wants"), { recursive: true });
    // Critical: broken dependency
    writeFileSync(
      join(svcDir, "broken.service"),
      "[Unit]\nRequires=ghost.service\n[Service]\nRestart=on-failure\n",
    );
    writeFileSync(
      join(svcDir, "anqr-symphony-executor@.service"),
      "[Service]\nEnvironment=BRIDGE_MODE=worktree\nRestart=on-failure\n",
    );

    await expect(
      enforceConfigPreflight({
        templatePath: template,
        surfaces: [{ name: "test", path: surface }],
        servicesDir: svcDir,
        wantsDir: join(svcDir, "default.target.wants"),
      }),
    ).rejects.toThrow("Config preflight failed");
  });
});

// ---------------------------------------------------------------------------
// 7. Real repo validation (verify against actual project files)
// ---------------------------------------------------------------------------

describe("Real repo config validation", () => {
  it("generateEnvConfig validates real template exists", async () => {
    const { generateEnvConfig } =
      await import("../../harness/ops/harness-doctor/generate-env-config.mjs");
    const templatePath = resolve(REPO_ROOT, "services/systemd/anqr-ops.env");

    const result = await generateEnvConfig({
      mode: "validate",
      templatePath,
      surfaces: [], // no surfaces to check — just verify template parsing
    });

    expect(result.templateKeyCount).toBeGreaterThan(30);
    expect(result.pass).toBe(true); // no surfaces = vacuously true
  });

  it("checkServiceLifecycle passes for real repo services", async () => {
    const { checkServiceLifecycle } =
      await import("../../harness/ops/harness-doctor/check-service-lifecycle.mjs");

    const result = await checkServiceLifecycle({
      enforce: false,
      servicesDir: resolve(REPO_ROOT, "services/systemd"),
      wantsDir: resolve(REPO_ROOT, "services/systemd/default.target.wants"),
    });

    expect(result.criticalIssues).toHaveLength(0);
  });

  it("real timer schedules have safe minimum gaps", async () => {
    const { validateTimerSchedules } =
      await import("../../harness/ops/harness-doctor/validate-timer-schedules.mjs");
    const issues = validateTimerSchedules(resolve(REPO_ROOT, "services/systemd"));
    expect(issues).toHaveLength(0);
  });

  it("real dependency chains are all valid", async () => {
    const { validateDependencyChains } =
      await import("../../harness/ops/harness-doctor/validate-dependency-chains.mjs");

    const issues = validateDependencyChains(resolve(REPO_ROOT, "services/systemd"));
    expect(issues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 8. Integration: harness-doctor exports all new modules
// ---------------------------------------------------------------------------

describe("Harness-doctor integration", () => {
  it("index.mjs exports generateEnvConfig", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("generateEnvConfig");
  });

  it("index.mjs exports enforceConfigPreflight", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("enforceConfigPreflight");
  });

  it("index.mjs exports validateTimerSchedules and validateDependencyChains", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateTimerSchedules");
    expect(source).toContain("validateDependencyChains");
  });

  it("main.mjs includes Config Surface Alignment category", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/main.mjs"),
      "utf-8",
    );
    expect(source).toContain("Config Surface Alignment");
    expect(source).toContain("generateEnvConfig");
  });

  it("main.mjs supports --enforce flag", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/main.mjs"),
      "utf-8",
    );
    expect(source).toContain("--enforce");
    expect(source).toContain("enforce");
  });

  it("index.mjs exports checkKeyRotation and parseEnvEntries", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("checkKeyRotation");
    expect(source).toContain("parseEnvEntries");
  });

  it("main.mjs includes Key Rotation Tracking category", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/harness-doctor/main.mjs"),
      "utf-8",
    );
    expect(source).toContain("Key Rotation Tracking");
    expect(source).toContain("checkKeyRotation");
  });
});

// ---------------------------------------------------------------------------
// 9. parseEnvEntries — value-aware env parsing (runtime behavior)
// ---------------------------------------------------------------------------

describe("parseEnvEntries", () => {
  let tmpDir: string;
  let parseEnvEntries: (filePath: string) => Array<Record<string, unknown>>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-env-entries-"));
    const mod = await import("../../harness/ops/harness-doctor/parse-env-entries.mjs");
    parseEnvEntries = mod.parseEnvEntries;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns hashes, not raw values", () => {
    const envFile = join(tmpDir, "hashed.env");
    writeFileSync(envFile, "SECRET_KEY=super_secret_value_123\n");

    const entries = parseEnvEntries(envFile);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe("SECRET_KEY");
    expect(entries[0].valueHash).toBeDefined();
    expect(typeof entries[0].valueHash).toBe("string");
    expect(entries[0].valueHash).toHaveLength(64); // sha256 hex
    // Must NOT contain the raw value
    expect(JSON.stringify(entries[0])).not.toContain("super_secret_value_123");
  });

  it("detects empty values", () => {
    const envFile = join(tmpDir, "empty.env");
    writeFileSync(envFile, "EMPTY_KEY=\nPOPULATED_KEY=value\n");

    const entries = parseEnvEntries(envFile);
    const empty = entries.find((e: Record<string, unknown>) => e.key === "EMPTY_KEY");
    const populated = entries.find((e: Record<string, unknown>) => e.key === "POPULATED_KEY");

    expect(empty?.isEmpty).toBe(true);
    expect(empty?.isPlaceholder).toBe(false);
    expect(populated?.isEmpty).toBe(false);
  });

  it("detects placeholder values", () => {
    const envFile = join(tmpDir, "placeholders.env");
    writeFileSync(
      envFile,
      "A=REPLACE_WITH_REAL_KEY\nB=changeme\nC=TODO\nD=xxxx\nE=your_key_here\nF=real_value\n",
    );

    const entries = parseEnvEntries(envFile);
    const results: Record<string, boolean> = {};
    for (const e of entries) {
      results[e.key as string] = e.isPlaceholder as boolean;
    }

    expect(results.A).toBe(true);
    expect(results.B).toBe(true);
    expect(results.C).toBe(true);
    expect(results.D).toBe(true);
    expect(results.E).toBe(true);
    expect(results.F).toBe(false);
  });

  it("skips comments and blank lines", () => {
    const envFile = join(tmpDir, "comments.env");
    writeFileSync(envFile, "# comment\n\nKEY=val\n# another comment\n");

    const entries = parseEnvEntries(envFile);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe("KEY");
  });

  it("returns empty array for non-existent file", () => {
    const entries = parseEnvEntries(join(tmpDir, "nonexistent.env"));
    expect(entries).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 10. checkKeyRotation — rotation ledger tracking (runtime behavior)
// ---------------------------------------------------------------------------

describe("checkKeyRotation", () => {
  let tmpDir: string;
  let checkKeyRotation: (opts?: Record<string, unknown>) => Promise<Record<string, unknown>>;

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "anqr-key-rotation-"));
    const mod = await import("../../harness/ops/harness-doctor/check-key-rotation.mjs");
    checkKeyRotation = mod.checkKeyRotation;
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates ledger on first run", async () => {
    const envFile = join(tmpDir, "first-run.env");
    writeFileSync(envFile, "KEY_A=value_a\nKEY_B=value_b\n");
    const ledgerFile = join(tmpDir, "first-ledger.json");

    expect(existsSync(ledgerFile)).toBe(false);

    const result = await checkKeyRotation({
      envPath: envFile,
      ledgerPath: ledgerFile,
    });

    expect(result.pass).toBe(true);
    expect(result.totalKeys).toBe(2);
    expect(result.populatedKeys).toBe(2);
    expect(existsSync(ledgerFile)).toBe(true);

    const ledger = JSON.parse(readFileSync(ledgerFile, "utf-8"));
    expect(ledger.version).toBe(1);
    expect(ledger.keys.KEY_A).toBeDefined();
    expect(ledger.keys.KEY_B).toBeDefined();
    expect(ledger.keys.KEY_A.hash).toHaveLength(64);
  });

  it("detects hash changes (rotation) on second run", async () => {
    const envFile = join(tmpDir, "rotation.env");
    const ledgerFile = join(tmpDir, "rotation-ledger.json");

    // First run
    writeFileSync(envFile, "TOKEN=old_value\n");
    await checkKeyRotation({ envPath: envFile, ledgerPath: ledgerFile });

    // Second run with changed value
    writeFileSync(envFile, "TOKEN=new_value\n");
    const result = await checkKeyRotation({ envPath: envFile, ledgerPath: ledgerFile });

    expect(result.rotatedKeys).toContain("TOKEN");
    expect((result.rotatedKeys as string[]).length).toBe(1);
  });

  it("reports stale keys beyond threshold", async () => {
    const envFile = join(tmpDir, "stale.env");
    const ledgerFile = join(tmpDir, "stale-ledger.json");

    writeFileSync(envFile, "OLD_KEY=some_value\n");

    // Pre-seed ledger with old rotation date
    const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const { createHash } = await import("node:crypto");
    const hash = createHash("sha256").update("some_value").digest("hex");
    writeFileSync(
      ledgerFile,
      JSON.stringify({
        version: 1,
        keys: { OLD_KEY: { hash, lastRotatedAt: oldDate, lastCheckedAt: oldDate } },
      }),
    );

    const result = await checkKeyRotation({
      envPath: envFile,
      ledgerPath: ledgerFile,
      maxAgeDays: 90,
    });

    expect(result.pass).toBe(true); // stale is advisory, not blocking
    expect(result.staleKeys).toContain("OLD_KEY");
  });

  it("fails for empty/placeholder values", async () => {
    const envFile = join(tmpDir, "empty-vals.env");
    const ledgerFile = join(tmpDir, "empty-vals-ledger.json");

    writeFileSync(envFile, "GOOD_KEY=real_value\nEMPTY_KEY=\nPLACEHOLDER=REPLACE\n");

    const result = await checkKeyRotation({ envPath: envFile, ledgerPath: ledgerFile });

    expect(result.pass).toBe(false);
    expect(result.emptyKeys).toContain("EMPTY_KEY");
    expect(result.placeholderKeys).toContain("PLACEHOLDER");
    expect(result.populatedKeys).toBe(1);
  });

  it("result never contains raw secret values", async () => {
    const envFile = join(tmpDir, "no-leak.env");
    const ledgerFile = join(tmpDir, "no-leak-ledger.json");

    writeFileSync(envFile, "API_KEY=sk-1234567890abcdef\nSECRET=hunter2\n");

    const result = await checkKeyRotation({ envPath: envFile, ledgerPath: ledgerFile });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("sk-1234567890abcdef");
    expect(serialized).not.toContain("hunter2");
  });

  it("passes for fully populated env file", async () => {
    const envFile = join(tmpDir, "full.env");
    const ledgerFile = join(tmpDir, "full-ledger.json");

    writeFileSync(envFile, "A=val1\nB=val2\nC=val3\n");

    const result = await checkKeyRotation({ envPath: envFile, ledgerPath: ledgerFile });

    expect(result.pass).toBe(true);
    expect(result.totalKeys).toBe(3);
    expect(result.populatedKeys).toBe(3);
    expect(result.emptyKeys).toHaveLength(0);
    expect(result.placeholderKeys).toHaveLength(0);
  });

  it("returns failure for non-existent env file", async () => {
    const result = await checkKeyRotation({
      envPath: join(tmpDir, "does-not-exist.env"),
      ledgerPath: join(tmpDir, "phantom-ledger.json"),
    });

    expect(result.pass).toBe(false);
    expect(result.detail).toContain("not found");
  });
});

// ---------------------------------------------------------------------------
// 11. Config preflight wiring — source verification
// ---------------------------------------------------------------------------

describe("Config preflight lifecycle wiring", () => {
  it("maybeRunPreflights.mjs imports enforceConfigPreflight", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/maybe-run-preflights.mjs"),
      "utf-8",
    );
    expect(source).toContain("enforceConfigPreflight");
    expect(source).toContain('import("../../harness-doctor.mjs")');
  });

  it("maybeRunPreflights.mjs uses configPreflight cache keys", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/maybe-run-preflights.mjs"),
      "utf-8",
    );
    expect(source).toContain('"configPreflight.pass"');
    expect(source).toContain('"configPreflight.checkedAt"');
  });

  it("maybeRunPreflights.mjs returns config-preflight failure shape", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/maybe-run-preflights.mjs"),
      "utf-8",
    );
    expect(source).toContain('check: "config-preflight"');
    expect(source).toContain("pass: false");
  });

  it("maybeRunPreflights.mjs uses time-based cache interval", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/maybe-run-preflights.mjs"),
      "utf-8",
    );
    expect(source).toContain("CONFIG_PREFLIGHT_INTERVAL_MS");
    // 1 hour = 60 * 60 * 1000
    expect(source).toContain("60 * 60 * 1000");
  });

  it("bridge runtime.mjs calls enforceConfigPreflight (advisory)", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/runtime.mjs"),
      "utf-8",
    );
    expect(source).toContain("enforceConfigPreflight");
    expect(source).toContain("enforce-config-preflight.mjs");
  });

  it("bridge runtime.mjs config preflight is advisory (try/catch, logWarn)", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/runtime.mjs"),
      "utf-8",
    );
    // Must be in a try/catch — advisory, not fatal
    expect(source).toContain("Config preflight advisory");
    expect(source).toContain("logWarn");
  });

  it("main.mjs runner handles config-preflight failure correctly", () => {
    const source = fs.readFileSync(
      resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/main.mjs"),
      "utf-8",
    );
    // main.mjs already handles preflight.pass === false by degrading to repair-only
    expect(source).toContain("preflight.pass");
    expect(source).toContain("pre-flight");
    expect(source).toContain("failed");
  });
});
