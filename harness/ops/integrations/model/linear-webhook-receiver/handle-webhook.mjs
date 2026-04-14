import { detectAndMarkDiscordSource } from "../../../core/discord-source.mjs";
import { correlationIdFromRequest } from "../../../lib/correlation-id.mjs";
import { createEvidenceRecord } from "../../../core/task-evidence.mjs";

import { isDuplicate } from "./is-duplicate.mjs";
import { shouldProcessEvent } from "./should-process-event.mjs";
import { triggerIssueExecution } from "./trigger-issue-execution.mjs";
import { verifySignature } from "./verify-signature.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export function handleWebhook(req, res) {
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

      // Generate correlation ID for end-to-end traceability
      const correlationId = correlationIdFromRequest(req);

      // Parse event
      const event = JSON.parse(rawBody);
      logDebug(`Received webhook: ${event.type} ${event.action} [${correlationId}]`);

      // Process event
      const processedEvent = shouldProcessEvent(event);

      if (!processedEvent) {
        // Not something we need to act on
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ignored" }));
        return;
      }

      // Create authoritative evidence record at ingress
      createEvidenceRecord(correlationId, {
        source: "linear-webhook",
        issueIdentifier: processedEvent.identifier,
        webhookDeliveryId: deliveryId || null,
        receivedAt: new Date().toISOString(),
      });

      // Try to determine if this issue was created from Discord
      // This info is used by scheduler and router logic to keep Discord-sourced work on the Discord pool
      try {
        const { getIssueDetail } = await import("../../linear/linear-client.mjs");
        const issueData = await getIssueDetail(processedEvent.identifier);
        if (issueData && detectAndMarkDiscordSource(issueData, processedEvent.identifier)) {
          logInfo(`Marked ${processedEvent.identifier} as Discord-sourced`);
        }
      } catch (err) {
        logDebug(
          `Could not determine Discord source for ${processedEvent.identifier}: ${err.message}`,
        );
      }

      // Trigger execution on least-loaded wt1-4 executor
      const success = await triggerIssueExecution(processedEvent, correlationId);

      if (success) {
        logInfo(
          `Processed ${processedEvent.action}: ${processedEvent.identifier} (${processedEvent.state}) [${correlationId}]`,
        );
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
