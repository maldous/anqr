#!/usr/bin/env node

/**
 * incident-resolution.mjs — Auto-resolve incidents when health checks pass
 */

import { listIssuesByState, updateIssue, addComment } from "./linear-client.mjs";
import { STATES } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logDebug } = createLogger();

// Service health check endpoints
const HEALTH_ENDPOINTS = {
  symphony: "http://127.0.0.1:4319/health",
  codebuff: "http://127.0.0.1:4318/health",
};

// Required healthy duration before auto-resolving (1 hour)
const HEALTHY_DURATION_MS = 60 * 60 * 1000;

/**
 * Check service health endpoint
 */
async function checkServiceHealth(service) {
  const endpoint = HEALTH_ENDPOINTS[service];
  if (!endpoint) {
    return { healthy: false, reason: "no health endpoint configured" };
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(endpoint, {
      signal: controller.signal,
      method: "GET",
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return {
        healthy: true,
        status: data.status || "ok",
        data,
      };
    } else {
      return { healthy: false, reason: `HTTP ${response.status}` };
    }
  } catch (err) {
    return { healthy: false, reason: err.message };
  }
}

/**
 * Extract service name from incident title or description
 */
function extractServiceName(issue) {
  const { title, description } = issue;
  
  // Check title for service mentions
  const titleMatch = title.match(/(?:symphony|codebuff)/i);
  if (titleMatch) {
    return titleMatch[0].toLowerCase();
  }
  
  // Check description for service field
  const descMatch = description?.match(/\*\*Service:\*\* (\w+)/);
  if (descMatch) {
    return descMatch[1].toLowerCase();
  }
  
  return null;
}

/**
 * Check if incident can be auto-resolved
 */
async function canAutoResolve(issue) {
  const service = extractServiceName(issue);
  
  if (!service) {
    logDebug(`[incident-resolver] ${issue.identifier}: No service found, cannot auto-resolve`);
    return { canResolve: false, reason: "no service identified" };
  }
  
  // Check service health
  const health = await checkServiceHealth(service);
  
  if (!health.healthy) {
    logDebug(`[incident-resolver] ${issue.identifier}: Service ${service} still unhealthy (${health.reason})`);
    return { canResolve: false, reason: `service unhealthy: ${health.reason}` };
  }
  
  // Check how long the incident has been open
  const incidentAge = Date.now() - new Date(issue.createdAt).getTime();
  
  // Must be healthy for at least HEALTHY_DURATION_MS since incident creation
  if (incidentAge < HEALTHY_DURATION_MS) {
    const remainingMs = HEALTHY_DURATION_MS - incidentAge;
    const remainingMin = Math.ceil(remainingMs / (60 * 1000));
    logDebug(
      `[incident-resolver] ${issue.identifier}: Service healthy but incident too recent (${remainingMin}min remaining)`,
    );
    return {
      canResolve: false,
      reason: `waiting for ${remainingMin}min healthy period`,
    };
  }
  
  logInfo(`[incident-resolver] ${issue.identifier}: Service ${service} healthy for >1h, can auto-resolve`);
  return {
    canResolve: true,
    service,
    healthData: health.data,
  };
}

/**
 * Auto-resolve an incident
 */
async function autoResolveIncident(issue, resolution) {
  const { service, healthData } = resolution;
  
  // Add resolution comment
  const commentLines = [
    "## Auto-Resolution",
    "",
    `**Service:** ${service}`,
    `**Health Status:** ${healthData?.status || "ok"}`,
    `**Resolved At:** ${new Date().toISOString()}`,
    "",
    "Service has been healthy for >1 hour since incident creation.",
    "",
    "If the issue recurs, a new incident will be created automatically.",
  ];
  
  if (healthData) {
    commentLines.push("");
    commentLines.push("### Health Check Data");
    commentLines.push("```json");
    commentLines.push(JSON.stringify(healthData, null, 2));
    commentLines.push("```");
  }
  
  await addComment(issue.id, commentLines.join("\n"));
  
  // Move to Done
  await updateIssue(issue.id, { stateId: STATES.done });
  
  logInfo(`[incident-resolver] ✅ Auto-resolved ${issue.identifier}`);
}

/**
 * Main resolution check
 */
async function main() {
  logInfo("[incident-resolver] Starting incident resolution check...");
  
  // Find open incidents (Todo, In Progress, In Review)
  const openStates = ["Todo", "In Progress", "In Review"];
  const issues = await listIssuesByState(openStates);
  
  // Filter to only incidents with the incident label
  const incidents = issues.filter((issue) =>
    issue.labels?.nodes?.some((label) => label.name === "incident"),
  );
  
  logInfo(`[incident-resolver] Found ${incidents.length} open incidents`);
  
  let resolved = 0;
  let skipped = 0;
  
  for (const issue of incidents) {
    try {
      const resolution = await canAutoResolve(issue);
      
      if (resolution.canResolve) {
        await autoResolveIncident(issue, resolution);
        resolved++;
      } else {
        skipped++;
      }
      
      // Rate limit: small delay between checks
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      logWarn(`[incident-resolver] Failed to check ${issue.identifier}: ${err.message}`);
    }
  }
  
  logInfo(`[incident-resolver] Complete: ${resolved} resolved, ${skipped} skipped`);
}

await main();
