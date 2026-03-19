import { getStore } from "@netlify/blobs";

const MCP_AUDIT_STORE = "mcp-audit-log";

export function getMcpAuditStore() {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    return getStore({ name: MCP_AUDIT_STORE, siteID, token });
  }
  return getStore(MCP_AUDIT_STORE);
}
