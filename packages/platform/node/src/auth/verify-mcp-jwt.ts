import { createRemoteJWKSet, jwtVerify } from "jose";
import type { McpAuthConfig } from "./mcp-auth-config.types";
import { hasRequiredScope } from "./has-required-scope";

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function verifyMcpJwt(token: string, config: McpAuthConfig): Promise<boolean> {
  if (!config.jwksUrl) {
    return false;
  }

  const jwks = jwksCache.get(config.jwksUrl) || createRemoteJWKSet(new URL(config.jwksUrl));
  jwksCache.set(config.jwksUrl, jwks);
  const verification = await jwtVerify(token, jwks, {
    issuer: config.issuer,
    audience: config.audience,
  });

  return hasRequiredScope(verification.payload.scope, config.requiredScope);
}
