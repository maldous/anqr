import type { McpAuthMode } from "./mcp-auth-mode.types";

export interface McpAuthConfig {
  mode: McpAuthMode;
  bearerTokens: string[];
  jwksUrl?: string;
  issuer?: string;
  audience?: string;
  requiredScope?: string;
}
