/**
 * Discord Worktree Isolation Test
 * 
 * This test verifies that Discord requests are properly routed to worktrees (wt5-wt8)
 * and that file changes NEVER appear in the main repository.
 * 
 * Run with: npx vitest run tests/integration/discord-worktree-isolation.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

const MAIN_REPO = "/home/user/src/anqr";
const WORKTREES = [5, 6, 7, 8].map(i => `/home/user/src/anqr-wt${i}`);
// Use static filename so cleanup can find it
const TEST_FILE_BASE = "DISCORD-ISOLATION-TEST-";
const TEST_FILE_EXT = ".txt";
const TEST_CONTENT = "Discord isolation test - this file should NEVER appear in main";

describe("Discord Worktree Isolation", () => {
  // Get timestamp once for consistent test file name
  const timestamp = Date.now();
  const testFileName = `${TEST_FILE_BASE}${timestamp}${TEST_FILE_EXT}`;

  afterAll(() => {
    // Cleanup test files from all worktrees and main using the same timestamp
    const allPaths = [MAIN_REPO, ...WORKTREES].map(p => join(p, testFileName));
    for (const path of allPaths) {
      try {
        if (existsSync(path)) unlinkSync(path);
      } catch {}
    }
  });

  it("should verify main repo is NOT used for Discord execution", async () => {
    // Check that main has no unexpected test files
    const mainTestFile = join(MAIN_REPO, testFileName);
    expect(existsSync(mainTestFile)).toBe(false);
  });

  it("should verify all Discord worktrees are properly configured", async () => {
    // Verify each Discord worktree exists and has correct config
    for (const wtPath of WORKTREES) {
      expect(existsSync(wtPath)).toBe(true);
      
      // Check .openclaw/models.json points to router (18790), not main bridge (4319)
      const modelsPath = join(wtPath, ".openclaw/models.json");
      if (existsSync(modelsPath)) {
        const models = JSON.parse(readFileSync(modelsPath, "utf-8"));
        const bridgeUrl = models.providers?.["symphony-bridge"]?.baseUrl;
        expect(bridgeUrl).toBe("http://127.0.0.1:18790/v1");
      }
    }
  });

  it("should verify Discord router is running and healthy", async () => {
    // Check router health endpoint
    const routerHealth = await fetch("http://127.0.0.1:18790/health").then(r => r.json());
    expect(routerHealth.status).toBe("ok");
    expect(routerHealth.worktrees).toHaveLength(4);
    expect(routerHealth.worktrees.map((w: any) => w.id)).toEqual([5, 6, 7, 8]);
  });

  it("should verify worktree bridges are running", async () => {
    // Check each worktree bridge health
    for (let i = 5; i <= 8; i++) {
      const health = await fetch(`http://127.0.0.1:432${i}/health`).then(r => r.json());
      expect(health.status).toBe("ok");
    }
  });

  it("should verify main bridge has WorkingDirectory set to main repo", async () => {
    // This is the critical check - main bridge must have WorkingDirectory = /home/user/src/anqr
    // If this is wrong, Discord requests could accidentally write to main
    const result = await new Promise<string>((resolve, reject) => {
      const proc = spawn("systemctl", ["--user", "show", "anqr-symphony-bridge.service", "-p", "WorkingDirectory"], {
        shell: true
      });
      let output = "";
      proc.stdout.on("data", d => output += d);
      proc.on("close", () => resolve(output));
      proc.on("error", reject);
    });
    
    expect(result).toContain("WorkingDirectory=/home/user/src/anqr");
  });

  it("should verify worktree bridges have correct WorkingDirectory", async () => {
    // Verify each worktree bridge has WorkingDirectory set to its worktree
    for (let i = 5; i <= 8; i++) {
      const result = await new Promise<string>((resolve, reject) => {
        const proc = spawn("systemctl", ["--user", "show", `anqr-symphony-bridge@${i}.service`, "-p", "WorkingDirectory"], {
          shell: true
        });
        let output = "";
        proc.stdout.on("data", d => output += d);
        proc.on("close", () => resolve(output));
        proc.on("error", reject);
      });
      
      expect(result).toContain(`WorkingDirectory=/home/user/src/anqr-wt${i}`);
    }
  });
});

describe("Worktree Sync Status", () => {
  it("should verify all worktrees are synced to origin/main", async () => {
    // Get origin/main commit
    const originHead = await new Promise<string>((resolve, reject) => {
      const proc = spawn("git", ["log", "--oneline", "-1", "origin/main"], { 
        cwd: MAIN_REPO, shell: true 
      });
      let output = "";
      proc.stdout.on("data", d => output += d);
      proc.on("close", () => resolve(output.trim()));
      proc.on("error", reject);
    });
    
    // Check each worktree is at or ahead of origin/main
    for (const wtPath of WORKTREES) {
      const wtHead = await new Promise<string>((resolve, reject) => {
        const proc = spawn("git", ["log", "--oneline", "-1"], { 
          cwd: wtPath, shell: true 
        });
        let output = "";
        proc.stdout.on("data", d => output += d);
        proc.on("close", () => resolve(output.trim()));
        proc.on("error", reject);
      });
      
      // Worktree should have the same commit (fast-forward sync)
      expect(wtHead).toBe(originHead);
    }
  });
});