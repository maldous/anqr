/**
 * Helper to spawn Codebuff bridge server on dynamic port for testing
 * Prevents "address already in use" errors when running tests
 */

import { spawn } from "node:child_process";
import { join } from "node:path";
import type { BridgeInstance } from "./bridge-instance.types";
import { findAvailablePort } from "./find-available-port";
import { waitForBridgeReady } from "./wait-for-bridge-ready";

/**
 * Spawn a Codebuff bridge instance on a dynamic port
 */
export async function spawnCodebuffBridge(options: {
  preferredPort?: number;
  apiKey?: string;
  env?: Record<string, string>;
} = {}): Promise<BridgeInstance> {
  const preferredPort = options.preferredPort ?? 14318; // Higher port range for tests
  const apiKey = options.apiKey ?? "test-codebuff";
  
  // Find available port
  const port = await findAvailablePort(preferredPort);
  const baseUrl = `http://127.0.0.1:${port}`;
  
  // Spawn bridge process
  const scriptPath = join(
    process.cwd(),
    "scripts/ops/integrations/model/codebuff-openai-bridge.mjs"
  );
  
  const bridgeProcess = spawn("node", [scriptPath], {
    env: {
      ...process.env,
      ...options.env,
      CODEBUFF_BRIDGE_PORT: String(port),
      CODEBUFF_BRIDGE_API_KEY: apiKey,
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  
  // Collect logs for debugging
  const logs: string[] = [];
  bridgeProcess.stdout?.on("data", (chunk) => {
    logs.push(chunk.toString());
  });
  bridgeProcess.stderr?.on("data", (chunk) => {
    logs.push(chunk.toString());
  });
  
  // Wait for bridge to be ready
  const ready = await waitForBridgeReady(baseUrl);
  
  if (!ready) {
    bridgeProcess.kill("SIGTERM");
    throw new Error(
      `Codebuff bridge failed to start on port ${port}. Logs:\n${logs.join("\n")}`
    );
  }
  
  const cleanup = async () => {
    return new Promise<void>((resolve) => {
      if (bridgeProcess.killed) {
        resolve();
        return;
      }
      
      bridgeProcess.once("exit", () => {
        resolve();
      });
      
      bridgeProcess.kill("SIGTERM");
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!bridgeProcess.killed) {
          bridgeProcess.kill("SIGKILL");
        }
      }, 5000);
    });
  };
  
  return {
    process: bridgeProcess,
    port,
    baseUrl,
    apiKey,
    cleanup,
  };
}
