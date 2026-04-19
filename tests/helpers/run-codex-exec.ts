/**
 * Helper to run `codex exec` against a dynamically-spawned Symphony bridge
 * instance for integration testing.
 *
 * The Codex CLI reads `[model_providers.symphony]` from `~/.codex/config.toml`,
 * but we override the `base_url` via `-c` flag so each test can target its
 * own isolated bridge on a random port.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, rmSync } from "node:fs";

export interface CodexExecResult {
  /** Exit code from the codex process */
  exitCode: number | null;
  /** Combined stdout output */
  stdout: string;
  /** Combined stderr output */
  stderr: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Whether the process timed out */
  timedOut: boolean;
}

export interface CodexExecOptions {
  /** The prompt to send to codex exec */
  prompt: string;
  /** Bridge base URL, e.g. http://127.0.0.1:14319 */
  bridgeBaseUrl: string;
  /** Bridge API key for Authorization header */
  bridgeApiKey?: string;
  /** Model to use (default: symphony/main) */
  model?: string;
  /** Model provider (default: symphony) */
  modelProvider?: string;
  /** Working directory for codex (default: process.cwd()) */
  cwd?: string;
  /** Timeout in milliseconds (default: 120_000) */
  timeoutMs?: number;
  /** Additional -c config overrides as key=value pairs */
  configOverrides?: Record<string, string>;
}

/**
 * Run `codex exec` against an isolated Symphony bridge instance.
 *
 * Uses `-c` flag overrides to redirect the symphony model_provider to the
 * test bridge's dynamic port, avoiding any need to modify ~/.codex/config.toml.
 */
export function runCodexExec(options: CodexExecOptions): Promise<CodexExecResult> {
  const {
    prompt,
    bridgeBaseUrl,
    bridgeApiKey,
    model = "symphony/main",
    modelProvider = "symphony",
    cwd = process.cwd(),
    timeoutMs = 120_000,
    configOverrides = {},
  } = options;

  const start = Date.now();

  // Build args array. spawn() does NOT use a shell, so -c and its value
  // must be separate array elements. Codex CLI parses -c values as TOML,
  // so strings need surrounding double-quotes (no shell single-quotes).
  const args: string[] = [
    "-c", `model="${model}"`,
    "-c", `model_provider="${modelProvider}"`,
    "-c", `model_providers.symphony.base_url="${bridgeBaseUrl}/v1"`,
  ];

  // Pass bridge API key so Codex can authenticate with the test bridge
  if (bridgeApiKey) {
    args.push("-c", `model_providers.symphony.api_key="${bridgeApiKey}"`);
  }

  // Add any extra config overrides
  for (const [key, value] of Object.entries(configOverrides)) {
    args.push("-c", `${key}="${value}"`);
  }

  args.push("exec", "--", prompt);

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const proc: ChildProcess = spawn("codex", args, {
      cwd,
      env: {
        ...process.env,
        NODE_ENV: "test",
        // Ensure codex doesn't prompt for approval
        CODEX_SANDBOX_MODE: "danger-full-access",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
      // Force kill after 5s if SIGTERM doesn't work
      setTimeout(() => {
        if (!proc.killed) proc.kill("SIGKILL");
      }, 5000);
    }, timeoutMs);

    proc.on("close", (code) => {
      clearTimeout(timeoutHandle);
      resolve({
        exitCode: code,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timeoutHandle);
      stderr += `\n[spawn error: ${err.message}]`;
      resolve({
        exitCode: null,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut: false,
      });
    });
  });
}

/**
 * Create a temporary directory for codex sandbox writes.
 * Caller is responsible for cleanup via cleanupTempDir().
 */
export function createTempWorkDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "codex-test-"));
  return dir;
}

/** Remove a temporary directory created by createTempWorkDir */
export function cleanupTempDir(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore — temp dirs are cleaned on reboot anyway
  }
}
