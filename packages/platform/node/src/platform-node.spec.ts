import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { extractBearerToken } from "./auth/extract-bearer-token";
import { hasRequiredScope } from "./auth/has-required-scope";
import { createUnauthorizedResponse } from "./auth/create-unauthorized-response";
import { getConfiguredBearerTokens } from "./auth/get-configured-bearer-tokens";
import { buildFirebaseAuthConfig } from "./auth/build-firebase-auth-config";
import { buildJwksAuthConfig } from "./auth/build-jwks-auth-config";
import { getMcpAuthConfig } from "./auth/get-mcp-auth-config";
import { getClientKey } from "./rate-limit/get-client-key";
import { getRateLimitPerMinute } from "./rate-limit/get-rate-limit-per-minute";
import { createRateLimitResponse } from "./rate-limit/create-rate-limit-response";
import { MCP_RATE_LIMIT_WINDOW_MS } from "./rate-limit/mcp-rate-limit.const";
import { MCP_RATE_LIMIT_POLICY } from "./rate-limit/mcp-rate-limit-policy";
import { API_QR_RATE_LIMIT_POLICY } from "./rate-limit/api-qr-rate-limit-policy";
import { normalizeHexColor } from "./mcp/tools/normalize-hex-color";
import { createMcpErrorResult } from "./mcp/tools/create-mcp-error-result";
import { createMcpImageResult } from "./mcp/tools/create-mcp-image-result";
import { buildIntentGuidance } from "./mcp/prompts/build-intent-guidance";
import { getAuditContext } from "./mcp/get-audit-context";
import { MCP_ROUTE_POLICY } from "./security/mcp-route-policy";
import { API_QR_ROUTE_POLICY } from "./security/api-qr-route-policy";
import { isRedirectStatus } from "./server/is-redirect-status";
import { isMissingBlobsEnvironmentError } from "./server/is-missing-blobs-environment-error";
import { CORS_HEADERS } from "./server/cors-headers.const";
import { SENTINEL_PREFIX } from "./server/sentinel-prefix.const";
import { SENTINEL_TTL_MS } from "./server/sentinel-ttl-ms.const";
import { NON_CACHE_PARAMS } from "./server/bg-non-cache-params.const";

const ENV_KEYS = [
  "MCP_AUTH_MODE",
  "MCP_BEARER_TOKEN",
  "MCP_BEARER_TOKENS",
  "MCP_JWKS_URL",
  "AUTH_JWKS_URL",
  "MCP_FIREBASE_PROJECT_ID",
  "AUTH_FIREBASE_PROJECT_ID",
  "FIREBASE_PROJECT_ID",
  "MCP_JWT_ISSUER",
  "AUTH_JWT_ISSUER",
  "MCP_JWT_AUDIENCE",
  "AUTH_JWT_AUDIENCE",
  "MCP_JWT_SCOPE",
  "AUTH_JWT_SCOPE",
  "MCP_FIREBASE_JWKS_URL",
  "AUTH_FIREBASE_JWKS_URL",
  "MCP_RATE_LIMIT_PER_MINUTE",
];

describe("platform/node", () => {
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] !== undefined) {
        process.env[key] = savedEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  // ── Auth: extractBearerToken ───────────────────────────────────

  describe("extractBearerToken", () => {
    it("returns null when no authorization header", () => {
      const req = new Request("https://example.com");
      expect(extractBearerToken(req)).toBeNull();
    });

    it("returns token from valid Bearer header", () => {
      const req = new Request("https://example.com", {
        headers: { authorization: "Bearer my-token-123" },
      });
      expect(extractBearerToken(req)).toBe("my-token-123");
    });

    it("is case-insensitive on scheme", () => {
      const req = new Request("https://example.com", {
        headers: { authorization: "bearer abc" },
      });
      expect(extractBearerToken(req)).toBe("abc");
    });

    it("returns null for non-Bearer scheme", () => {
      const req = new Request("https://example.com", {
        headers: { authorization: "Basic abc123" },
      });
      expect(extractBearerToken(req)).toBeNull();
    });

    it("returns null when token part is missing", () => {
      const req = new Request("https://example.com", {
        headers: { authorization: "Bearer" },
      });
      expect(extractBearerToken(req)).toBeNull();
    });
  });

  // ── Auth: hasRequiredScope ─────────────────────────────────────

  describe("hasRequiredScope", () => {
    it("returns true when no scope is required", () => {
      expect(hasRequiredScope("anything", undefined)).toBe(true);
    });

    it("returns true when required scope is in claim", () => {
      expect(hasRequiredScope("read write admin", "write")).toBe(true);
    });

    it("returns false when required scope is not in claim", () => {
      expect(hasRequiredScope("read write", "admin")).toBe(false);
    });

    it("returns false when scope claim is not a string", () => {
      expect(hasRequiredScope(42, "read")).toBe(false);
      expect(hasRequiredScope(null, "read")).toBe(false);
    });
  });

  // ── Auth: createUnauthorizedResponse ───────────────────────────

  describe("createUnauthorizedResponse", () => {
    it("returns 401 status", () => {
      const res = createUnauthorizedResponse();
      expect(res.status).toBe(401);
    });

    it("has plain text content type", () => {
      const res = createUnauthorizedResponse();
      expect(res.headers.get("content-type")).toContain("text/plain");
    });
  });

  // ── Auth: getConfiguredBearerTokens ────────────────────────────

  describe("getConfiguredBearerTokens", () => {
    it("returns empty array when no env vars set", () => {
      expect(getConfiguredBearerTokens()).toEqual([]);
    });

    it("reads from MCP_BEARER_TOKEN", () => {
      process.env.MCP_BEARER_TOKEN = "tok1";
      expect(getConfiguredBearerTokens()).toEqual(["tok1"]);
    });

    it("splits comma-separated tokens", () => {
      process.env.MCP_BEARER_TOKENS = "tok1,tok2,tok3";
      expect(getConfiguredBearerTokens()).toEqual(["tok1", "tok2", "tok3"]);
    });

    it("trims whitespace and filters empty entries", () => {
      process.env.MCP_BEARER_TOKENS = " tok1 , , tok2 ";
      expect(getConfiguredBearerTokens()).toEqual(["tok1", "tok2"]);
    });
  });

  // ── Auth: buildFirebaseAuthConfig ──────────────────────────────

  describe("buildFirebaseAuthConfig", () => {
    it("builds config with default JWKS URL and issuer", () => {
      const config = buildFirebaseAuthConfig("my-project");
      expect(config.mode).toBe("firebase");
      expect(config.jwksUrl).toContain("googleapis.com");
      expect(config.issuer).toContain("my-project");
      expect(config.audience).toBe("my-project");
    });

    it("uses env var overrides for issuer and audience", () => {
      process.env.MCP_JWT_ISSUER = "custom-issuer";
      process.env.MCP_JWT_AUDIENCE = "custom-audience";
      const config = buildFirebaseAuthConfig("proj");
      expect(config.issuer).toBe("custom-issuer");
      expect(config.audience).toBe("custom-audience");
    });

    it("trims project ID", () => {
      const config = buildFirebaseAuthConfig("  spaced-project  ");
      expect(config.issuer).toContain("spaced-project");
      expect(config.issuer).not.toContain(" ");
    });
  });

  // ── Auth: buildJwksAuthConfig ──────────────────────────────────

  describe("buildJwksAuthConfig", () => {
    it("builds JWKS config with provided URL", () => {
      const config = buildJwksAuthConfig("https://example.com/.well-known/jwks.json");
      expect(config.mode).toBe("jwks");
      expect(config.jwksUrl).toBe("https://example.com/.well-known/jwks.json");
    });

    it("picks up scope from env", () => {
      process.env.MCP_JWT_SCOPE = "qr:generate";
      const config = buildJwksAuthConfig("https://jwks.example.com");
      expect(config.requiredScope).toBe("qr:generate");
    });
  });

  // ── Auth: getMcpAuthConfig ─────────────────────────────────────

  describe("getMcpAuthConfig", () => {
    it("returns disabled when nothing is configured", () => {
      const config = getMcpAuthConfig();
      expect(config.mode).toBe("disabled");
    });

    it("returns bearer mode when tokens are set", () => {
      process.env.MCP_BEARER_TOKEN = "secret";
      const config = getMcpAuthConfig();
      expect(config.mode).toBe("bearer");
      expect(config.bearerTokens).toContain("secret");
    });

    it("returns firebase mode when project ID exists", () => {
      process.env.FIREBASE_PROJECT_ID = "anqr-link";
      const config = getMcpAuthConfig();
      expect(config.mode).toBe("firebase");
    });

    it("returns jwks mode when JWKS URL is set", () => {
      process.env.MCP_JWKS_URL = "https://example.com/jwks";
      const config = getMcpAuthConfig();
      expect(config.mode).toBe("jwks");
    });

    it("respects explicit MCP_AUTH_MODE=bearer", () => {
      process.env.MCP_AUTH_MODE = "bearer";
      process.env.MCP_BEARER_TOKEN = "tok";
      const config = getMcpAuthConfig();
      expect(config.mode).toBe("bearer");
    });
  });

  // ── Rate-limit: getClientKey ───────────────────────────────────

  describe("getClientKey", () => {
    it("extracts first IP from x-forwarded-for", () => {
      const req = new Request("https://example.com", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      expect(getClientKey(req)).toBe("1.2.3.4");
    });

    it("falls back to x-nf-client-connection-ip", () => {
      const req = new Request("https://example.com", {
        headers: { "x-nf-client-connection-ip": "10.0.0.1" },
      });
      expect(getClientKey(req)).toBe("10.0.0.1");
    });

    it("falls back to client-ip", () => {
      const req = new Request("https://example.com", {
        headers: { "client-ip": "192.168.1.1" },
      });
      expect(getClientKey(req)).toBe("192.168.1.1");
    });

    it("returns unknown-client when no headers present", () => {
      const req = new Request("https://example.com");
      expect(getClientKey(req)).toBe("unknown-client");
    });
  });

  // ── Rate-limit: getRateLimitPerMinute ──────────────────────────

  describe("getRateLimitPerMinute", () => {
    it("defaults to 30", () => {
      expect(getRateLimitPerMinute()).toBe(30);
    });

    it("reads custom value from env", () => {
      process.env.MCP_RATE_LIMIT_PER_MINUTE = "100";
      expect(getRateLimitPerMinute()).toBe(100);
    });

    it("falls back to 30 for invalid values", () => {
      process.env.MCP_RATE_LIMIT_PER_MINUTE = "not-a-number";
      expect(getRateLimitPerMinute()).toBe(30);
    });
  });

  // ── Rate-limit: createRateLimitResponse ────────────────────────

  describe("createRateLimitResponse", () => {
    it("returns 429 status", () => {
      const res = createRateLimitResponse(60);
      expect(res.status).toBe(429);
    });

    it("sets retry-after header", () => {
      const res = createRateLimitResponse(30);
      expect(res.headers.get("retry-after")).toBe("30");
    });

    it("has plain text content type", () => {
      const res = createRateLimitResponse(10);
      expect(res.headers.get("content-type")).toContain("text/plain");
    });
  });

  // ── Rate-limit constants ───────────────────────────────────────

  describe("rate-limit constants", () => {
    it("MCP_RATE_LIMIT_WINDOW_MS is 60 seconds", () => {
      expect(MCP_RATE_LIMIT_WINDOW_MS).toBe(60_000);
    });

    it("MCP_RATE_LIMIT_POLICY has expected route", () => {
      expect(MCP_RATE_LIMIT_POLICY.route).toBe("/api/mcp");
      expect(MCP_RATE_LIMIT_POLICY.requestsPerMinute).toBe(30);
    });

    it("API_QR_RATE_LIMIT_POLICY has expected route", () => {
      expect(API_QR_RATE_LIMIT_POLICY.route).toBe("/api/contract/qr");
      expect(API_QR_RATE_LIMIT_POLICY.requestsPerMinute).toBe(60);
    });
  });

  // ── MCP tools: normalizeHexColor ───────────────────────────────

  describe("normalizeHexColor", () => {
    it("prepends # when missing", () => {
      expect(normalizeHexColor("ff0000")).toBe("#ff0000");
    });

    it("leaves # intact when already present", () => {
      expect(normalizeHexColor("#00ff00")).toBe("#00ff00");
    });

    it("handles shorthand hex", () => {
      expect(normalizeHexColor("abc")).toBe("#abc");
    });
  });

  // ── MCP tools: createMcpErrorResult ────────────────────────────

  describe("createMcpErrorResult", () => {
    it("wraps message with Error prefix", () => {
      const result = createMcpErrorResult("something broke");
      expect(result.content[0].text).toBe("Error: something broke");
    });

    it("sets isError to true", () => {
      const result = createMcpErrorResult("fail");
      expect(result.isError).toBe(true);
    });

    it("has text content type", () => {
      const result = createMcpErrorResult("x");
      expect(result.content[0].type).toBe("text");
    });
  });

  // ── MCP tools: createMcpImageResult ────────────────────────────

  describe("createMcpImageResult", () => {
    it("returns base64 image for PNG", () => {
      const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const result = createMcpImageResult(buf, "image/png");
      expect(result.content[0].type).toBe("image");
      expect((result.content[0] as { data: string }).data).toBe(buf.toString("base64"));
    });

    it("includes mime type for binary images", () => {
      const buf = Buffer.from([0xff, 0xd8]);
      const result = createMcpImageResult(buf, "image/jpeg");
      expect((result.content[0] as { mimeType: string }).mimeType).toBe("image/jpeg");
    });

    it("returns text for SVG", () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
      const buf = Buffer.from(svg, "utf-8");
      const result = createMcpImageResult(buf, "image/svg+xml");
      expect(result.content[0].type).toBe("text");
      expect((result.content[0] as { text: string }).text).toContain("<svg");
    });

    it("does not set isError", () => {
      const buf = Buffer.from("data");
      const result = createMcpImageResult(buf, "image/png");
      expect(result).not.toHaveProperty("isError");
    });
  });

  // ── MCP prompts: buildIntentGuidance ────────────────────────────

  describe("buildIntentGuidance", () => {
    it("returns URL guidance", () => {
      expect(buildIntentGuidance("url")).toContain("URL");
    });

    it("returns WiFi guidance", () => {
      expect(buildIntentGuidance("wifi")).toContain("WIFI");
    });

    it("returns contact guidance", () => {
      expect(buildIntentGuidance("contact")).toContain("vCard");
    });

    it("returns payment guidance", () => {
      expect(buildIntentGuidance("payment")).toContain("payment");
    });

    it("returns plain text guidance", () => {
      expect(buildIntentGuidance("plain_text")).toContain("short");
    });
  });

  // ── MCP: getAuditContext ───────────────────────────────────────

  describe("getAuditContext", () => {
    it("extracts method and pathname", () => {
      const req = new Request("https://example.com/api/mcp", { method: "POST" });
      const ctx = getAuditContext(req);
      expect(ctx.method).toBe("POST");
      expect(ctx.pathname).toBe("/api/mcp");
    });

    it("extracts cf-connecting-ip", () => {
      const req = new Request("https://example.com/x", {
        headers: { "cf-connecting-ip": "1.1.1.1" },
      });
      expect(getAuditContext(req).clientIp).toBe("1.1.1.1");
    });

    it("falls back to x-forwarded-for", () => {
      const req = new Request("https://example.com/x", {
        headers: { "x-forwarded-for": "2.2.2.2, 3.3.3.3" },
      });
      expect(getAuditContext(req).clientIp).toBe("2.2.2.2");
    });

    it("returns null for missing IP and user-agent", () => {
      const req = new Request("https://example.com/x");
      const ctx = getAuditContext(req);
      expect(ctx.clientIp).toBeNull();
      expect(ctx.userAgent).toBeNull();
    });
  });

  // ── Security: route policies ───────────────────────────────────

  describe("route policies", () => {
    it("MCP route targets /api/mcp", () => {
      expect(MCP_ROUTE_POLICY.route).toBe("/api/mcp");
      expect(MCP_ROUTE_POLICY.classification).toBe("ai_tool");
    });

    it("MCP route has auth and audit controls", () => {
      expect(MCP_ROUTE_POLICY.perimeterControls).toContain("auth");
      expect(MCP_ROUTE_POLICY.perimeterControls).toContain("audit");
      expect(MCP_ROUTE_POLICY.perimeterControls).toContain("rate-limit");
    });

    it("API QR route targets /api/contract/qr", () => {
      expect(API_QR_ROUTE_POLICY.route).toBe("/api/contract/qr");
      expect(API_QR_ROUTE_POLICY.classification).toBe("public");
    });

    it("API QR route has rate-limit only", () => {
      expect(API_QR_ROUTE_POLICY.perimeterControls).toEqual(["rate-limit"]);
    });
  });

  // ── Server: isRedirectStatus ───────────────────────────────────

  describe("isRedirectStatus", () => {
    it("returns true for 301", () => {
      expect(isRedirectStatus(301)).toBe(true);
    });

    it("returns true for 302", () => {
      expect(isRedirectStatus(302)).toBe(true);
    });

    it("returns true for 303", () => {
      expect(isRedirectStatus(303)).toBe(true);
    });

    it("returns true for 307", () => {
      expect(isRedirectStatus(307)).toBe(true);
    });

    it("returns true for 308", () => {
      expect(isRedirectStatus(308)).toBe(true);
    });

    it("returns false for 200", () => {
      expect(isRedirectStatus(200)).toBe(false);
    });

    it("returns false for 404", () => {
      expect(isRedirectStatus(404)).toBe(false);
    });
  });

  // ── Server: isMissingBlobsEnvironmentError ─────────────────────

  describe("isMissingBlobsEnvironmentError", () => {
    it("returns false for null", () => {
      expect(isMissingBlobsEnvironmentError(null)).toBe(false);
    });

    it("returns false for non-object", () => {
      expect(isMissingBlobsEnvironmentError("error")).toBe(false);
    });

    it("matches by name", () => {
      expect(isMissingBlobsEnvironmentError({ name: "MissingBlobsEnvironmentError" })).toBe(true);
    });

    it("matches by message content", () => {
      expect(
        isMissingBlobsEnvironmentError({
          message: "The environment has not been configured to use Netlify Blobs",
        }),
      ).toBe(true);
    });

    it("returns false for unrelated errors", () => {
      expect(isMissingBlobsEnvironmentError({ name: "TypeError", message: "cannot read" })).toBe(
        false,
      );
    });
  });

  // ── Server constants ───────────────────────────────────────────

  describe("server constants", () => {
    it("CORS_HEADERS allows all origins", () => {
      expect(CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("CORS_HEADERS allows GET and OPTIONS", () => {
      expect(CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("GET");
      expect(CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("OPTIONS");
    });

    it("SENTINEL_PREFIX is rendering:", () => {
      expect(SENTINEL_PREFIX).toBe("rendering:");
    });

    it("SENTINEL_TTL_MS is 10 minutes", () => {
      expect(SENTINEL_TTL_MS).toBe(600_000);
    });

    it("NON_CACHE_PARAMS includes expected keys", () => {
      expect(NON_CACHE_PARAMS.has("_cb")).toBe(true);
      expect(NON_CACHE_PARAMS.has("lang")).toBe(true);
      expect(NON_CACHE_PARAMS.has("_fullRender")).toBe(true);
    });

    it("NON_CACHE_PARAMS does not include cache-relevant params", () => {
      expect(NON_CACHE_PARAMS.has("data")).toBe(false);
      expect(NON_CACHE_PARAMS.has("size")).toBe(false);
    });
  });
});
