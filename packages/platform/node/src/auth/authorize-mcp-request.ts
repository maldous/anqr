import { createUnauthorizedResponse } from "./create-unauthorized-response";
import { extractBearerToken } from "./extract-bearer-token";
import { getMcpAuthConfig } from "./get-mcp-auth-config";
import { verifyMcpJwt } from "./verify-mcp-jwt";

export async function authorizeMcpRequest(request: Request): Promise<Response | null> {
  const config = getMcpAuthConfig();
  if (config.mode === "disabled") {
    return null;
  }

  const token = extractBearerToken(request);
  if (!token) {
    return createUnauthorizedResponse();
  }

  if (config.mode === "bearer") {
    return config.bearerTokens.includes(token) ? null : createUnauthorizedResponse();
  }

  try {
    return (await verifyMcpJwt(token, config)) ? null : createUnauthorizedResponse();
  } catch {
    return createUnauthorizedResponse();
  }
}
