#!/usr/bin/env node

/**
 * context7-server.mjs — Local Context7 MCP server wrapper
 *
 * Spawns and manages a local Context7 MCP server using @upstash/context7-mcp.
 * Provides a programmatic interface to resolve documentation requests locally
 * before falling back to the Context7 cloud API.
 *
 * Features:
 *   - Spawns @upstash/context7-mcp as a child process via npx
 *   - Communicates over stdio using JSON-RPC 2.0 (MCP protocol)
 *   - Health check via JSON-RPC ping
 *   - Automatic fallback to Context7 cloud API when local server is unavailable
 *   - Graceful lifecycle management (start, stop, health check)
 *
 * Exported functions:
 *   startContext7Server()   — Spawn the local MCP server process
 *   stopContext7Server()    — Gracefully stop the local MCP server process
 *   isContext7ServerHealthy() — Check if the local server is responding
 *   resolveDocsLocally({ libraryTitle, topic, max_tokens }) — Resolve docs via local server or cloud fallback
 *
 * Environment:
 *   CONTEXT7_API_KEY        — API key for cloud API fallback
 *   CONTEXT7_STARTUP_TIMEOUT_MS — Server startup timeout in ms (default: 15000)
 *   CONTEXT7_REQUEST_TIMEOUT_MS — Per-request timeout in ms (default: 30000)
 *
 * Usage:
 *   import { startContext7Server, resolveDocsLocally, stopContext7Server } from './context7-server.mjs';
 *
 *   await startContext7Server();
 *   const docs = await resolveDocsLocally({ libraryTitle: 'react', topic: 'hooks' });
 *   await stopContext7Server();
 */

import { spawn } from "node:child_process";
import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("context7-server");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const STARTUP_TIMEOUT_MS = Number.parseInt(process.env.CONTEXT7_STARTUP_TIMEOUT_MS || "15000", 10);
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.CONTEXT7_REQUEST_TIMEOUT_MS || "30000", 10);
const CLOUD_API_BASE = "https://api.upstash.com/v1/context7";

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** @type {import('node:child_process').ChildProcess | null} */
let serverProcess = null;

/** Whether the server has completed its initialization handshake */
let serverReady = false;

/** Monotonically increasing JSON-RPC request id */
let nextRequestId = 1;

/**
 * Pending JSON-RPC responses keyed by request id.
 * Each entry holds { resolve, reject, timer } so we can match responses.
 * @type {Map<number, { resolve: Function, reject: Function, timer: ReturnType<typeof setTimeout> }>}
 */
const pendingRequests = new Map();

/** Buffer for partial stdout data (JSON-RPC messages may arrive in chunks) */
let stdoutBuffer = "";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse newline-delimited JSON-RPC messages from the server stdout stream.
 * Handles partial reads by buffering across data events.
 * @param {string} chunk - Raw string chunk from stdout
 */
function handleStdoutData(chunk) {
  stdoutBuffer += chunk;

  // Process all complete lines (newline-delimited JSON-RPC)
  let newlineIdx;
  while ((newlineIdx = stdoutBuffer.indexOf("\n")) !== -1) {
    const line = stdoutBuffer.slice(0, newlineIdx).trim();
    stdoutBuffer = stdoutBuffer.slice(newlineIdx + 1);

    if (!line) continue;

    try {
      const message = JSON.parse(line);
      logDebug("Received JSON-RPC message", { id: message.id, method: message.method });
      handleJsonRpcMessage(message);
    } catch (err) {
      logWarn(`Failed to parse JSON-RPC message: ${err.message}`, { raw: line.slice(0, 200) });
    }
  }
}

/**
 * Route an incoming JSON-RPC message to the correct pending request handler
 * or handle server-initiated notifications.
 * @param {object} message - Parsed JSON-RPC message
 */
function handleJsonRpcMessage(message) {
  // Response to a request we sent
  if (message.id !== undefined && pendingRequests.has(message.id)) {
    const { resolve, reject, timer } = pendingRequests.get(message.id);
    pendingRequests.delete(message.id);
    clearTimeout(timer);

    if (message.error) {
      reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
    return;
  }

  // Server-initiated notification (no id) — log and discard
  if (message.method) {
    logDebug(`Server notification: ${message.method}`);
  }
}

/**
 * Send a JSON-RPC 2.0 request to the local MCP server and wait for a response.
 * @param {string} method - JSON-RPC method name
 * @param {object} [params] - Method parameters
 * @param {number} [timeoutMs] - Per-request timeout (default: REQUEST_TIMEOUT_MS)
 * @returns {Promise<object>} The result field from the JSON-RPC response
 */
function sendRequest(method, params = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    if (!serverProcess || !serverProcess.stdin || serverProcess.killed) {
      reject(new Error("Context7 MCP server is not running"));
      return;
    }

    const id = nextRequestId++;
    const request = { jsonrpc: "2.0", id, method, params };

    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`JSON-RPC request ${method} (id=${id}) timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timer });

    const payload = JSON.stringify(request) + "\n";
    logDebug(`Sending JSON-RPC request: ${method}`, { id });

    try {
      serverProcess.stdin.write(payload, "utf-8", (err) => {
        if (err) {
          pendingRequests.delete(id);
          clearTimeout(timer);
          reject(new Error(`Failed to write to server stdin: ${err.message}`));
        }
      });
    } catch (err) {
      pendingRequests.delete(id);
      clearTimeout(timer);
      reject(new Error(`Failed to send request: ${err.message}`));
    }
  });
}

/**
 * Reject all pending requests — called when the server process exits unexpectedly.
 * @param {string} reason - Human-readable reason for the rejection
 */
function rejectAllPending(reason) {
  for (const [, { reject, timer }] of pendingRequests) {
    clearTimeout(timer);
    reject(new Error(reason));
  }
  pendingRequests.clear();
}

// ---------------------------------------------------------------------------
// Cloud API fallback
// ---------------------------------------------------------------------------

/**
 * Resolve a library identifier via the Context7 cloud API.
 * @param {string} libraryTitle - Library name to search for
 * @returns {Promise<string|null>} Context7-compatible library ID or null
 */
async function resolveLibraryIdCloud(libraryTitle) {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  try {
    const response = await fetch(`${CLOUD_API_BASE}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: libraryTitle }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      logWarn(`Cloud resolve-library-id failed: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.id || data?.libraryId || data?.context7CompatibleLibraryID || null;
  } catch (err) {
    logError(`Cloud resolve-library-id error: ${err.message}`);
    return null;
  }
}

/**
 * Fetch library documentation from the Context7 cloud API.
 * @param {string} libraryId - Resolved Context7 library ID
 * @param {string} [topic] - Optional topic filter
 * @param {number} [maxTokens] - Maximum tokens to return (default: 5000)
 * @returns {Promise<string|null>} Documentation text or null
 */
async function getLibraryDocsCloud(libraryId, topic, _maxTokens = 5000) {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  try {
    const body = { libraryId };
    if (topic) body.query = topic;

    const response = await fetch(`${CLOUD_API_BASE}/docs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      logWarn(`Cloud get-library-docs failed: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Context7 returns an array of result objects with snippets
    if (data?.results && Array.isArray(data.results)) {
      const docs = data.results
        .map((r) => {
          const parts = [];
          if (r.title) parts.push(`## ${r.title}`);
          if (r.description) parts.push(r.description);
          if (r.codeExample) parts.push(`\`\`\`\n${r.codeExample}\n\`\`\``);
          if (r.snippet) parts.push(r.snippet);
          if (r.sourceUrl) parts.push(`Source: ${r.sourceUrl}`);
          return parts.join("\n\n");
        })
        .join("\n\n---\n\n");
      return docs || null;
    }
    return data?.documentation || data?.content || JSON.stringify(data);
  } catch (err) {
    logError(`Cloud get-library-docs error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start the local Context7 MCP server as a child process.
 *
 * Spawns `npx -y @upstash/context7-mcp` and waits for the server to be ready
 * by sending an MCP `initialize` handshake.
 *
 * @returns {Promise<boolean>} true if the server started successfully
 */
export async function startContext7Server() {
  if (serverProcess && !serverProcess.killed) {
    logInfo("Context7 MCP server already running");
    return true;
  }

  logInfo("Starting Context7 MCP server...");

  return new Promise((resolve) => {
    const env = { ...process.env };

    serverProcess = spawn("npx", ["-y", "@upstash/context7-mcp"], {
      stdio: ["pipe", "pipe", "pipe"],
      env,
      shell: false,
    });

    serverReady = false;
    stdoutBuffer = "";
    nextRequestId = 1;

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
      serverReady = false;
      rejectAllPending(`Server exited (code=${code}, signal=${signal})`);
      serverProcess = null;
    });

    serverProcess.on("error", (err) => {
      logError(`Context7 MCP server spawn error: ${err.message}`);
      serverReady = false;
      serverProcess = null;
      resolve(false);
    });

    // Wait a short moment for the process to start, then send the MCP initialize handshake
    const startupTimer = setTimeout(() => {
      logError(`Context7 MCP server failed to respond within ${STARTUP_TIMEOUT_MS}ms`);
      serverReady = false;
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

        serverReady = true;
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

/**
 * Stop the local Context7 MCP server gracefully.
 *
 * Sends SIGTERM and waits briefly for the process to exit before force-killing.
 *
 * @returns {Promise<void>}
 */
export async function stopContext7Server() {
  if (!serverProcess) {
    logDebug("Context7 MCP server is not running — nothing to stop");
    return;
  }

  logInfo("Stopping Context7 MCP server...");

  rejectAllPending("Server is shutting down");

  return new Promise((resolve) => {
    const forceKillTimer = setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        logWarn("Force-killing Context7 MCP server (SIGKILL)");
        serverProcess.kill("SIGKILL");
      }
      cleanup();
      resolve();
    }, 5000);

    function cleanup() {
      clearTimeout(forceKillTimer);
      serverProcess = null;
      serverReady = false;
      stdoutBuffer = "";
    }

    if (serverProcess.killed) {
      cleanup();
      resolve();
      return;
    }

    serverProcess.once("exit", () => {
      logInfo("Context7 MCP server stopped");
      cleanup();
      resolve();
    });

    serverProcess.kill("SIGTERM");
  });
}

/**
 * Check whether the local Context7 MCP server is running and responsive.
 *
 * Sends a lightweight JSON-RPC ping to verify the process is alive and handling
 * requests. Returns false if the server is not started, has exited, or does not
 * respond within 5 seconds.
 *
 * @returns {Promise<boolean>} true if the server is healthy
 */
export async function isContext7ServerHealthy() {
  if (!serverProcess || serverProcess.killed || !serverReady) {
    return false;
  }

  try {
    // Use tools/list as a lightweight health probe — it should always succeed
    await sendRequest("tools/list", {}, 5000);
    return true;
  } catch (err) {
    logWarn(`Health check failed: ${err.message}`);
    return false;
  }
}

/**
 * Resolve library documentation, attempting the local MCP server first and
 * falling back to the Context7 cloud API if the local server is unavailable.
 *
 * @param {object} options
 * @param {string} options.libraryTitle - Name of the library (e.g. "react", "express")
 * @param {string} [options.topic] - Optional topic filter (e.g. "hooks", "middleware")
 * @param {number} [options.max_tokens=5000] - Maximum tokens to return
 * @returns {Promise<{ source: string, documentation: string | null }>}
 */
export async function resolveDocsLocally({ libraryTitle, topic, max_tokens = 5000 }) {
  if (!libraryTitle) {
    logError("resolveDocsLocally called without libraryTitle");
    return { source: "error", documentation: null };
  }

  // -----------------------------------------------------------------------
  // Attempt 1: Local MCP server
  // -----------------------------------------------------------------------
  if (serverReady && serverProcess && !serverProcess.killed) {
    try {
      logDebug(`Resolving docs locally: ${libraryTitle}`, { topic, max_tokens });

      // Step 1 — resolve-library-id via MCP tools/call
      // The MCP tool requires both query and libraryName as required parameters
      const resolveResult = await sendRequest("tools/call", {
        name: "resolve-library-id",
        arguments: {
          query: topic
            ? `Documentation for ${libraryTitle} focusing on ${topic}`
            : `Documentation for ${libraryTitle}`,
          libraryName: libraryTitle,
        },
      });

      const libraryId = extractLibraryId(resolveResult);
      if (libraryId) {
        // Step 2 — query-docs via MCP tools/call
        // The MCP tool requires libraryId and query as required parameters
        const docsArgs = {
          libraryId,
          query: topic || `Documentation and examples for ${libraryTitle}`,
        };

        const docsResult = await sendRequest("tools/call", {
          name: "query-docs",
          arguments: docsArgs,
        });

        const documentation = extractDocumentation(docsResult);
        if (documentation) {
          logInfo(`Resolved docs locally for "${libraryTitle}"`, {
            topic,
            chars: documentation.length,
          });
          return { source: "local", documentation };
        }

        logWarn(`Local get-library-docs returned empty for "${libraryTitle}"`);
      } else {
        logWarn(`Local resolve-library-id returned no ID for "${libraryTitle}"`);
        // Fall through to cloud fallback
      }
    } catch (err) {
      logWarn(`Local MCP request failed for "${libraryTitle}": ${err.message}`);
    }
  } else {
    logDebug("Local MCP server unavailable — skipping to cloud fallback");
  }

  // -----------------------------------------------------------------------
  // Attempt 2: Cloud API fallback
  // -----------------------------------------------------------------------
  logInfo(`Falling back to cloud API for "${libraryTitle}"`);

  try {
    const libraryId = await resolveLibraryIdCloud(libraryTitle);
    if (!libraryId) {
      logWarn(`Cloud could not resolve library ID for "${libraryTitle}"`);
      return { source: "cloud", documentation: null };
    }

    const documentation = await getLibraryDocsCloud(libraryId, topic, max_tokens);
    if (documentation) {
      logInfo(`Resolved docs via cloud for "${libraryTitle}"`, {
        topic,
        chars: documentation.length,
      });
    }
    return { source: "cloud", documentation: documentation || null };
  } catch (err) {
    logError(`Cloud fallback failed for "${libraryTitle}": ${err.message}`);
    return { source: "error", documentation: null };
  }
}

// ---------------------------------------------------------------------------
// Result extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract a library ID from the MCP tools/call result for resolve-library-id.
 * The result shape may vary; try common locations.
 * @param {object} result - JSON-RPC result from tools/call
 * @returns {string|null}
 */
function extractLibraryId(result) {
  if (!result) return null;

  // MCP tools/call returns { content: [{ type: "text", text: "..." }] }
  if (Array.isArray(result.content)) {
    for (const block of result.content) {
      if (block.type === "text" && block.text) {
        // The text may be a JSON string containing the library ID
        try {
          const parsed = JSON.parse(block.text);
          if (parsed?.libraryId) return parsed.libraryId;
          if (parsed?.context7CompatibleLibraryID) return parsed.context7CompatibleLibraryID;
          // Sometimes the ID is returned as a plain string
          if (typeof parsed === "string") return parsed;
        } catch {
          // Not JSON — parse plain text response
          // Format: "Context7-compatible library ID: /org/project"
          const match = block.text.match(/Context7-compatible library ID:\s*(\/[^\s]+)/);
          if (match && match[1]) {
            return match[1].trim();
          }
          // Fallback: if the text starts with /, assume it's the ID
          if (block.text.trim().startsWith("/")) return block.text.trim();
        }
      }
    }
  }

  // Direct fields
  if (result.libraryId) return result.libraryId;
  if (result.context7CompatibleLibraryID) return result.context7CompatibleLibraryID;

  return null;
}

/**
 * Extract documentation text from the MCP tools/call result for get-library-docs.
 * @param {object} result - JSON-RPC result from tools/call
 * @returns {string|null}
 */
function extractDocumentation(result) {
  if (!result) return null;

  // MCP tools/call returns { content: [{ type: "text", text: "..." }] }
  if (Array.isArray(result.content)) {
    const texts = result.content
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text);
    if (texts.length > 0) return texts.join("\n\n");
  }

  // Direct fields
  if (result.documentation) return result.documentation;
  if (result.content && typeof result.content === "string") return result.content;

  return null;
}

// ---------------------------------------------------------------------------
// Graceful shutdown on process exit
// ---------------------------------------------------------------------------

async function handleShutdown(signal) {
  logInfo(`Received ${signal} — shutting down Context7 MCP server`);
  await stopContext7Server();
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
