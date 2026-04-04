import { spawn } from "node:child_process";

import { STARTUP_TIMEOUT_MS } from "./startup-timeout-ms.mjs";
import { handleStdoutData } from "./handle-stdout-data.mjs";
import { setNextRequestId } from "./next-request-id.mjs";
import { rejectAllPending } from "./reject-all-pending.mjs";
import { refreshToolRegistry } from "./refresh-tool-registry.mjs";
import { sendRequest } from "./send-request.mjs";
import { serverProcess, setServerProcess } from "./server-process.mjs";
import { setServerReady } from "./server-ready.mjs";
import { setStdoutBuffer } from "./stdout-buffer.mjs";
import { setToolRegistry } from "./tool-registry.mjs";
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
      spawn("npx", ["-y", "@upstash/context7-mcp", "--transport", "stdio"], {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        shell: false,
      }),
    );

    setServerReady(false);
    setToolRegistry(null);
    setStdoutBuffer("");
    setNextRequestId(1);

    serverProcess.stdout.setEncoding("utf-8");
    serverProcess.stdout.on("data", handleStdoutData);

    serverProcess.stderr.setEncoding("utf-8");
    serverProcess.stderr.on("data", (chunk) => {
      for (const line of chunk.split("\n")) {
        if (line.trim()) logDebug(`[mcp-stderr] ${line.trim()}`);
      }
    });

    serverProcess.on("exit", (code, signal) => {
      logWarn(`Context7 MCP server exited`, { code, signal });
      setServerReady(false);
      setToolRegistry(null);
      rejectAllPending(`Server exited (code=${code}, signal=${signal})`);
      setServerProcess(null);
    });

    serverProcess.on("error", (err) => {
      logError(`Context7 MCP server spawn error: ${err.message}`);
      setServerReady(false);
      setToolRegistry(null);
      setServerProcess(null);
      resolve(false);
    });

    const startupTimer = setTimeout(() => {
      logError(`Context7 MCP server failed to respond within ${STARTUP_TIMEOUT_MS}ms`);
      setServerReady(false);
      resolve(false);
    }, STARTUP_TIMEOUT_MS);

    setTimeout(async () => {
      try {
        const result = await sendRequest(
          "initialize",
          {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "context7-server-wrapper", version: "2.0.0" },
          },
          Math.max(1000, STARTUP_TIMEOUT_MS - 1000),
        );

        logInfo("Context7 MCP server initialized", {
          serverInfo: result?.serverInfo,
          capabilities: result?.capabilities,
        });

        if (serverProcess && serverProcess.stdin) {
          const notification =
            JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n";
          serverProcess.stdin.write(notification, "utf-8");
        }

        const registry = await refreshToolRegistry({ force: true, timeoutMs: 5000 });
        setServerReady(Boolean(registry?.tools?.length));

        clearTimeout(startupTimer);
        resolve(Boolean(registry?.tools?.length));
      } catch (err) {
        logError(`MCP initialize handshake failed: ${err.message}`);
        clearTimeout(startupTimer);
        resolve(false);
      }
    }, 500);
  });
}
