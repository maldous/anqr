#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";

const WORKTREE_ID = process.env.ANQR_WORKTREE_ID || "main";
const HOST = process.env.OPENCLAW_GATEWAY_HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.OPENCLAW_GATEWAY_PORT || "18789", 10);
const CLI = process.env.OPENCLAW_CLI || "openclaw";
const WORKTREE_PATH = process.env.ANQR_WORKTREE_PATH || process.cwd();
const DEFAULT_CONFIG = path.join(WORKTREE_PATH, ".openclaw", "openclaw.json");
const CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH || DEFAULT_CONFIG;
const LOCK_DIR = process.env.OPENCLAW_LOCK_DIR || path.join(os.homedir(), ".cache", "anqr-openclaw");
const LOCK_FILE = path.join(LOCK_DIR, "gateway.lock");
const FOLLOWER_SLEEP_MS = Number.parseInt(process.env.OPENCLAW_FOLLOWER_SLEEP_MS || "5000", 10);
const RESTART_BACKOFF_MS = Number.parseInt(process.env.OPENCLAW_RESTART_BACKOFF_MS || "15000", 10);
const WAIT_LOG_INTERVAL_MS = Number.parseInt(process.env.OPENCLAW_WAIT_LOG_INTERVAL_MS || "60000", 10);

let stopping = false;
let lockHeld = false;
let childProcess = null;

function log(level, message) {
  const ts = new Date().toISOString();
  console.log(`${ts} [discord-gateway ${WORKTREE_ID}] ${level} ${message}`);
}

const logInfo = (msg) => log("INFO", msg);
const logWarn = (msg) => log("WARN", msg);
const logError = (msg) => log("ERROR", msg);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPidAlive(pid) {
  if (!pid || Number.isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    if (err && err.code === "EPERM") return true;
    return false;
  }
}

async function ensureLockDir() {
  await fsp.mkdir(LOCK_DIR, { recursive: true });
}

async function readLockInfo() {
  try {
    const raw = await fsp.readFile(LOCK_FILE, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    logWarn(`Failed to read lock info: ${err.message}`);
    return null;
  }
}

async function cleanupStaleLock() {
  try {
    const info = await readLockInfo();
    if (!info) return;
    const ownerPid = info.gatewayPid || info.runnerPid;
    if (isPidAlive(ownerPid)) return;
    logWarn(
      `Removing stale gateway lock owned by ${info.worktree || "unknown"} (pid ${ownerPid || "?"})`,
    );
    await fsp.unlink(LOCK_FILE);
  } catch (err) {
    if (err.code !== "ENOENT") {
      logWarn(`Failed to clean up lock: ${err.message}`);
    }
  }
}

async function writeLockMetadata(extra = {}) {
  if (!lockHeld) return;
  const metadata = {
    worktree: WORKTREE_ID,
    runnerPid: process.pid,
    gatewayPid: extra.gatewayPid || null,
    updatedAt: new Date().toISOString(),
  };
  try {
    await fsp.writeFile(LOCK_FILE, JSON.stringify(metadata));
  } catch (err) {
    logWarn(`Unable to update lock metadata: ${err.message}`);
  }
}

async function tryAcquireLock() {
  try {
    const handle = await fsp.open(LOCK_FILE, "wx");
    await handle.close();
    lockHeld = true;
    await writeLockMetadata();
    logInfo(`Acquired gateway lock (port ${PORT})`);
    return true;
  } catch (err) {
    if (err.code === "EEXIST") {
      return false;
    }
    logError(`Failed to acquire gateway lock: ${err.message}`);
    return false;
  }
}

async function releaseLock() {
  if (!lockHeld) return;
  lockHeld = false;
  try {
    await fsp.unlink(LOCK_FILE);
    logInfo("Released gateway lock");
  } catch (err) {
    if (err.code !== "ENOENT") {
      logWarn(`Failed to release lock: ${err.message}`);
    }
  }
}

function spawnGatewayProcess() {
  const args = ["gateway"];
  if (CONFIG_PATH && fs.existsSync(CONFIG_PATH)) {
    args.push("--config", CONFIG_PATH);
  }
  if (process.env.OPENCLAW_GATEWAY_PROFILE) {
    args.push("--profile", process.env.OPENCLAW_GATEWAY_PROFILE);
  }

  const env = {
    ...process.env,
    NO_COLOR: "1",
    OPENCLAW_DISABLE_BONJOUR: "1",
    OPENCLAW_BONJOUR_MODE: "off",
    OPENCLAW_DISABLE_ADVERTISER: "1",
    OPENCLAW_GATEWAY_ADVERTISE: "off",
    OPENCLAW_GATEWAY_HOST: HOST,
    OPENCLAW_GATEWAY_BIND: HOST,
    OPENCLAW_GATEWAY_PORT: String(PORT),
  };

  logInfo(`Starting OpenClaw gateway via ${CLI} on ${HOST}:${PORT}`);
  const child = spawn(CLI, args, {
    stdio: "inherit",
    env,
  });

  child.once("spawn", () => {
    writeLockMetadata({ gatewayPid: child.pid }).catch(() => {});
  });

  child.on("error", (err) => {
    logError(`OpenClaw gateway failed to start: ${err.message}`);
  });

  return child;
}

async function runGatewayOwnerLoop() {
  while (!stopping) {
    childProcess = spawnGatewayProcess();
    const exitInfo = await new Promise((resolve) => {
      childProcess.once("exit", (code, signal) => {
        resolve({ code, signal });
      });
      childProcess.once("error", (err) => {
        resolve({ error: err });
      });
    });
    childProcess = null;

    if (stopping) break;

    if (exitInfo.error) {
      logWarn(`Gateway launch error; retrying in ${RESTART_BACKOFF_MS}ms`);
    } else {
      logWarn(
        `Gateway exited (code ${exitInfo.code ?? "?"}, signal ${exitInfo.signal ?? "?"}); restarting in ${RESTART_BACKOFF_MS}ms`,
      );
    }
    await sleep(RESTART_BACKOFF_MS + Math.floor(Math.random() * 5000));
  }
}

async function followerLoop() {
  let lastLog = 0;
  while (!stopping) {
    await cleanupStaleLock();
    const acquired = await tryAcquireLock();
    if (acquired) {
      await runGatewayOwnerLoop();
      await releaseLock();
      if (stopping) return;
    } else {
      const now = Date.now();
      if (now - lastLog > WAIT_LOG_INTERVAL_MS) {
        const info = await readLockInfo();
        const ownerDesc = info?.worktree || "unknown";
        logInfo(`Gateway already running (owner ${ownerDesc}); waiting...`);
        lastLog = now;
      }
      await sleep(FOLLOWER_SLEEP_MS + Math.floor(Math.random() * 2000));
    }
  }
}

function handleSignal(signal) {
  return () => {
    if (stopping) return;
    stopping = true;
    logInfo(`Received ${signal}, shutting down`);
    if (childProcess) {
      try {
        childProcess.kill(signal);
      } catch (err) {
        logWarn(`Failed to forward ${signal} to gateway: ${err.message}`);
      }
    }
  };
}

process.on("SIGTERM", handleSignal("SIGTERM"));
process.on("SIGINT", handleSignal("SIGINT"));
process.on("SIGHUP", handleSignal("SIGHUP"));

async function main() {
  await ensureLockDir();
  await followerLoop();
  await releaseLock();
  logInfo("Gateway singleton exit complete");
}

main().catch((err) => {
  logError(`Fatal gateway wrapper error: ${err.message}`);
  process.exitCode = 1;
});
