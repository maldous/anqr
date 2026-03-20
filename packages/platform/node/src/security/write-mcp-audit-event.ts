import { getMcpAuditStore } from "./get-mcp-audit-store";
import type { McpAuditEvent } from "./mcp-audit-event.types";

export async function writeMcpAuditEvent(event: McpAuditEvent): Promise<void> {
  const store = getMcpAuditStore();
  const key = `${event.timestamp}-${crypto.randomUUID()}.json`;
  await store.set(key, new Blob([JSON.stringify(event)]));
}
