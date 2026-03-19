import type { McpAuditOutcome } from "./mcp-audit-outcome.types";

export interface McpAuditEvent {
  timestamp: string;
  outcome: McpAuditOutcome;
  method: string;
  pathname: string;
  userAgent: string | null;
  clientIp: string | null;
  details: Record<string, unknown>;
}
