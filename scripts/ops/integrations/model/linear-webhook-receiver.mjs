#!/usr/bin/env node

/**
 * linear-webhook-receiver.mjs - Event-driven Linear webhook endpoint
 *
 * Receives webhook events from Linear and forwards them to the Symphony router.
 * Replaces timer-based polling with immediate event-driven processing.
 *
 * Usage:
 *   node linear-webhook-receiver.mjs [--port 18791]
 *
 * Environment:
 *   LINEAR_WEBHOOK_PORT    - Port to listen on (default: 18791)
 *   LINEAR_WEBHOOK_SECRET  - Secret for HMAC signature verification
 *   LINEAR_WORKTREES       - Comma-separated worktree IDs (default: 1,2,3,4)
 *
 * Configure in Linear:
 *   Settings -> API -> New webhook
 *   URL: https://your-domain/linear/webhook (if behind reverse proxy)
 *        http://127.0.0.1:18791/linear/webhook (if direct)
 */

import http from "node:http";
import crypto from "node:crypto";
import { createLogger } from "../../lib/logger.mjs";
import { detectAndMarkDiscordSource } from "../../core/discord-source.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

// Configuration
const PORT = process.env.LINEAR_WEBHOOK_PORT || 18791;
const WEBHOOK_SECRET = process.env.LINEAR_WEBHOOK_SECRET || process.env.LINEAR_API_KEY;
const WORKTREE_IDS = (process.env.LINEAR_WORKTREES || "1,2,3,4")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));

// Track recent deliveries to prevent duplicates (in-memory, reset on restart)
const recentDeliveries = new Set();
const DEDUP_WINDOW_MS = 60_000; // 1 minute window

// Clean old entries periodically
setInterval(() => {
  recentDeliveries.clear();
}, DEDUP_WINDOW_MS);

/**
 * Verify Linear webhook signature using HMAC-SHA256
 */
function verifySignature(rawBody, signature) {
  if (!signature || !WEBHOOK_SECRET) {
    logWarn("No signature or secret - skipping verification (not recommended for production)");
    return true;
  }

  try {
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    // timingSafeEqual throws if lengths differ
    if (sigBuffer.length !== expectedBuffer.length) {
      logWarn(`Signature length mismatch: ${sigBuffer.length} vs ${expectedBuffer.length}`);
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (err) {
    logError(`Signature verification error: ${err.message}`);
    return false;
  }
}

/**
 * Check for duplicate delivery
 */
function isDuplicate(deliveryId) {
  if (recentDeliveries.has(deliveryId)) {
    logWarn(`Duplicate delivery: ${deliveryId}`);
    return true;
  }
  recentDeliveries.add(deliveryId);
  return false;
}

/**
 * Determine if we should process this event and what action to take
 * 
 * State transition rules:
 * - create + Todo/InProgress -> TRIGGER (new issue ready for work)
 * - create + Backlog/Done/Canceled -> IGNORE (not ready)
 * - update to Todo -> TRIGGER (moved to ready state)
 * - update to InProgress -> TRIGGER (already being worked)
 * - update to Backlog -> IGNORE (moved out of ready state)
 * - update to Done -> IGNORE (completed externally)
 * - update to Canceled -> IGNORE (canceled externally)
 * - remove -> IGNORE (issue deleted)
 * - State unchanged (comment, label, etc.) -> IGNORE
 */
function shouldProcessEvent(event) {
  const { type, data, action, createdAt, updatedAt } = event;

  // Only process Issue events
  if (type !== "Issue") {
    logDebug(`Ignoring non-Issue event: ${type}`);
    return null;
  }

  const issue = data;
  if (!issue || !issue.identifier) {
    logWarn("No issue data in webhook event");
    return null;
  }

  const stateName = issue.state?.name || "unknown";
  const previousStateName = issue.previousValues?.state?.name;
  
  logDebug(`Issue ${issue.identifier}: action=${action}, state=${stateName}, previousState=${previousStateName}, createdAt=${createdAt}, updatedAt=${updatedAt}`);

  // Handle different actions
  if (action === "remove") {
    // Issue deleted - don't try to execute
    logInfo(`Ignoring removed issue: ${issue.identifier}`);
    return null;
  }

  if (action === "create") {
    // New issue created - only trigger if in ready state
    const readyStates = ["Todo", "In Progress"];
    if (readyStates.includes(stateName)) {
      return {
        identifier: issue.identifier,
        title: issue.title || "(no title)",
        action: "create",
        state: stateName,
        previousState: null,
        url: issue.url,
        reason: `created in ${stateName}`,
      };
    }
    // Created in Backlog/Done/Canceled - not ready for work
    logInfo(`Ignoring issue created in ${stateName}: ${issue.identifier}`);
    return null;
  }

  if (action === "update") {
    const readyStates = ["Todo", "In Progress"];

    // If moving TO a ready state (Todo/InProgress), ALWAYS trigger - even without previousStateName
    // This handles cases where Linear doesn't provide previousValues (e.g., API-created issues)
    // Moving into a ready state is inherently meaningful - the issue is ready for work
    if (readyStates.includes(stateName)) {
      // If we have previousStateName and it changed, include that info; otherwise note unknown previous
      const reason = previousStateName && previousStateName !== stateName
        ? `state changed from ${previousStateName} to ${stateName}`
        : `moved to ${stateName} (previous state unknown)`;

      logInfo(`Issue ${issue.identifier} moved to ${stateName} - triggering execution`);
      return {
        identifier: issue.identifier,
        title: issue.title || "(no title)",
        action: "update",
        state: stateName,
        previousState: previousStateName || null,
        url: issue.url,
        reason,
      };
    }

    // If we have previousStateName and it's different from current, it's a state change TO non-ready
    // Only ignore if state actually changed; otherwise could be metadata-only update
    if (previousStateName && previousStateName !== stateName) {
      logInfo(`Ignoring state change to ${stateName}: ${issue.identifier}`);
      return null;
    }

    // No previousStateName or state unchanged - this is a metadata-only update (comment, label, etc.)
    // Do NOT trigger execution - the runner already has the issue in its queue
    logDebug(`Ignoring metadata-only update for ${issue.identifier} (state unchanged: ${stateName})`);
    return null;
  }

  // Unknown action
  logDebug(`Ignoring unknown action: ${action}`);
  return null;
}

/**
 * Forward to Symphony router to trigger execution for the issue
 * Routes directly to wt1-wt4 based on least loaded
 */
async function triggerIssueExecution(processedEvent) {
  // Use the router's queue endpoint to signal new work
  // The router will route to least-loaded wt1-4 executor
  const routerUrl = "http://127.0.0.1:4319/v1/linear/trigger";

  try {
    // Send minimal trigger payload - the executor will fetch issue details
    const response = await fetch(routerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer local-symphony",
        "x-linear-identifier": processedEvent.identifier,
        "x-linear-action": processedEvent.action,
      },
      body: JSON.stringify({
        identifier: processedEvent.identifier,
        action: processedEvent.action,
        source: "linear-webhook",
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logWarn(`Trigger returned ${response.status}: ${errorText}`);
      return false;
    }

    logInfo(`Triggered execution for ${processedEvent.identifier} (${processedEvent.action})`);
    return true;
  } catch (err) {
    logError(`Failed to trigger execution: ${err.message}`);
    return false;
  }
}

/**
 * Health check endpoint
 */
function handleHealth(res) {
  const status = {
    status: "ok",
    port: PORT,
    worktrees: WORKTREE_IDS,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status));
}

/**
 * Main webhook handler
 */
function handleWebhook(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
    return;
  }

  // Collect body
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    try {
      const rawBody = Buffer.concat(chunks).toString("utf8");

      // Verify signature
      const signature = req.headers["linear-signature"];
      if (!verifySignature(rawBody, signature)) {
        logWarn("Invalid webhook signature");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Invalid signature" } }));
        return;
      }

      // Check for duplicate
      const deliveryId = req.headers["linear-delivery"];
      if (deliveryId && isDuplicate(deliveryId)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "duplicate" }));
        return;
      }

      // Parse event
      const event = JSON.parse(rawBody);
      logDebug(`Received webhook: ${event.type} ${event.action}`);

      // Process event
      const processedEvent = shouldProcessEvent(event);

      if (!processedEvent) {
        // Not something we need to act on
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ignored" }));
        return;
      }

      // Try to determine if this issue was created from Discord
      // This info is used by pickIssue() to route to the correct worktree type
      try {
        const { getIssue } = await import("../../integrations/linear/linear-client.mjs");
        const issueData = await getIssue(processedEvent.identifier);
        if (issueData && detectAndMarkDiscordSource(issueData, processedEvent.identifier)) {
          logInfo(`Marked ${processedEvent.identifier} as Discord-sourced`);
        }
      } catch (err) {
        logDebug(`Could not determine Discord source for ${processedEvent.identifier}: ${err.message}`);
      }

      // Trigger execution on least-loaded wt1-4 executor
      const success = await triggerIssueExecution(processedEvent);

      if (success) {
        logInfo(`Processed ${processedEvent.action}: ${processedEvent.identifier} (${processedEvent.state})`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "processed", event: processedEvent }));
      } else {
        // Router unavailable - return 503 so Linear will retry
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Router unavailable" } }));
      }
    } catch (err) {
      logError(`Webhook error: ${err.message}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: err.message } }));
    }
  });

  req.on("error", (err) => {
    logError(`Request error: ${err.message}`);
  });
}

// Create server
const server = http.createServer((req, res) => {
  logDebug(`${req.method} ${req.url}`);

  // Health endpoint
  if (req.method === "GET" && (req.url === "/health" || req.url === "/")) {
    return handleHealth(res);
  }

  // Webhook endpoint
  if (req.method === "POST" && req.url === "/linear/webhook") {
    return handleWebhook(req, res);
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: { message: "Not found" } }));
});

// Start server - bind to 0.0.0.0 to accept external connections via port forward
server.listen(PORT, "0.0.0.0", () => {
  logInfo("========================================");
  logInfo("Linear Webhook Receiver Starting");
  logInfo("========================================");
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Endpoint: /linear/webhook`);
  logInfo(`Worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Secret configured: ${!!WEBHOOK_SECRET}`);
  logInfo("========================================");
  logInfo("Ready to receive Linear webhook events");
  
  // Clear stale delivery tracking on startup to prevent false duplicates
  recentDeliveries.clear();
  logInfo("🔄 Cleared stale delivery tracking for immediate webhook processing");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logInfo("Received SIGTERM, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT, shutting down...");
  server.close(() => process.exit(0));
});

export { server, verifySignature, shouldProcessEvent };