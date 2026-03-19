import { writeMcpAuditEvent } from "../security";
import type { McpAuditEvent } from "../security/mcp-audit-event.types";
import { mcpLog } from "./log";
import type { McpAuditOutcome } from "./audit-mcp-outcome";
import { getAuditContext } from "./get-audit-context";

export async function auditMcpRequest(
  request: Request,
  outcome: McpAuditOutcome,
  details: Record<string, unknown> = {},
): Promise<void> {
  const context: McpAuditEvent = {
    timestamp: new Date().toISOString(),
    outcome,
    ...getAuditContext(request),
    details,
  };

  await writeMcpAuditEvent(context).catch((error) => {
    mcpLog.warn("MCP audit sink fallback", {
      message: error instanceof Error ? error.message : "Unknown audit sink error",
    });
  });

  if (outcome === "error" || outcome === "unauthorized" || outcome === "rate_limited") {
    mcpLog.warn("MCP request audit", context);
    return;
  }

  mcpLog.info("MCP request audit", context);
}
