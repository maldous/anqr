// Generated from ../../../../scripts/ops/runtime/mcp/context7-server.mjs:291

import { spawn } from "node:child_process";

import { STARTUP_TIMEOUT_MS } from "./startup-timeout-ms.mjs";
import { handleStdoutData } from "./handle-stdout-data.mjs";
import { nextRequestId, setNextRequestId } from "./next-request-id.mjs";
import { rejectAllPending } from "./reject-all-pending.mjs";
import { sendRequest } from "./send-request.mjs";
import { serverProcess, setServerProcess } from "./server-process.mjs";
import { serverReady, setServerReady } from "./server-ready.mjs";
import { stdoutBuffer, setStdoutBuffer } from "./stdout-buffer.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function startContext7Server() {
  if (serverProcess && !serverProcess.killed) {
    logInfo("Context7 MCP server already running");
    return true;
  }

  logInfo("Starting Context7 MCP server...");

  return new Promise((resolve) => {
    const env = { ...process.env };

    setServerProcess(
      spawn("npx", ["-y", "@upstash/context7-mcp"], {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        shell: false,
      }),
    );

    setServerReady(false);
    setStdoutBuffer("");
    setNextRequestId(1);

    // Handle stdout — JSON-RPC responses
    serverProcess.stdout.setEncoding("utf-8");
    serverProcess.stdout.on("data", handleStdoutData);

    // Handle stderr — log server diagnostic output
    serverProcess.stderr.setEncoding("utf-8");
    serverProcess.stderr.on("data", (chunk) => {
      for (const line of chunk.split("\n")) {
        if (line.trim()) logDebug(`[mcp-stderr] ${line.trim()}`);
      }
    });

    // Handle unexpected exit
    serverProcess.on("exit", (code, signal) => {
      logWarn(`Context7 MCP server exited`, { code, signal });
      setServerReady(false);
      rejectAllPending(`Server exited (code=${code}, signal=${signal})`);
      setServerProcess(null);
    });

    serverProcess.on("error", (err) => {
      logError(`Context7 MCP server spawn error: ${err.message}`);
      setServerReady(false);
      setServerProcess(null);
      resolve(false);
    });

    // Wait a short moment for the process to start, then send the MCP initialize handshake
    const startupTimer = setTimeout(() => {
      logError(`Context7 MCP server failed to respond within ${STARTUP_TIMEOUT_MS}ms`);
      setServerReady(false);
      resolve(false);
    }, STARTUP_TIMEOUT_MS);

    // Give the process a brief moment to start before sending initialize
    setTimeout(async () => {
      try {
        const result = await sendRequest(
          "initialize",
          {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "context7-server-wrapper", version: "1.0.0" },
          },
          STARTUP_TIMEOUT_MS - 1000,
        );

        logInfo("Context7 MCP server initialized", {
          serverInfo: result?.serverInfo,
          capabilities: result?.capabilities,
        });

        // Send initialized notification (MCP protocol requirement)
        if (serverProcess && serverProcess.stdin) {
          const notification =
            JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n";
          serverProcess.stdin.write(notification, "utf-8");
        }

        setServerReady(true);
        clearTimeout(startupTimer);
        resolve(true);
      } catch (err) {
        logError(`MCP initialize handshake failed: ${err.message}`);
        clearTimeout(startupTimer);
        resolve(false);
      }
    }, 500);
  });
}
