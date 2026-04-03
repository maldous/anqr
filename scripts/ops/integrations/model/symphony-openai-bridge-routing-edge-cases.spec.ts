import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock file I/O to prevent state file operations
vi.mock("node:fs", async (importOriginal) => {
  const orig = await importOriginal<typeof import("node:fs")>();
  return {
    ...orig,
    readFileSync: vi.fn(() => "{}"),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => false),
    mkdirSync: vi.fn(),
  };
});

// Mock Codex SDK to prevent real SDK instantiation during probes
vi.mock("@openai/codex-sdk", () => ({
  Codex: vi.fn().mockImplementation(() => ({
    startThread: vi.fn().mockReturnValue({
      run: vi.fn().mockRejectedValue(new Error("mock: Codex probe disabled in test")),
    }),
  })),
}));

// Mock provider health — all healthy by default
vi.mock("./symphony-provider-health.mjs", () => ({
  HEALTH_STATES: {
    HEALTHY: "healthy",
    DEGRADED: "degraded",
    COOLING_DOWN: "cooling-down",
    DISABLED: "disabled",
    BLOCKED: "blocked",
    UNKNOWN: "unknown",
  },
  PROVIDER_TIMEOUTS: { LOCAL: 60_000, HOSTED: 30_000 },
  getProviderTimeout: vi.fn(() => 30_000),
  getProviderHealthState: vi.fn(() => ({ state: "healthy", lastUpdated: Date.now() })),
  setProviderHealthState: vi.fn(),
  recordProviderHealthSuccess: vi.fn(),
  recordProviderHealthFailure: vi.fn(),
  shouldRetryProvider: vi.fn(() => true),
  resetProviderHealth: vi.fn(),
  checkPreferredProviderHealth: vi.fn(() => true),
  isLocalProvider: vi.fn(() => false),
  getAllProviderHealthStates: vi.fn(() => ({})),
}));

import { selectProvider } from "./symphony-credit-gate.mjs";
import { getProviderHealthState } from "./symphony-provider-health.mjs";
import { readFileSync } from "node:fs";

describe("Provider Routing Edge Cases", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set API keys for common providers
    process.env.GROQ_TOKEN = "test-groq-key";
    process.env.MISTRAL_TOKEN = "test-mistral-key";
    process.env.GEMINI_TOKEN = "test-gemini-key";
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.OPENROUTER_TOKEN = "test-openrouter-key";
    process.env.SAMBANOVA_TOKEN = "test-sambanova-key";
    process.env.CEREBRAS_TOKEN = "test-cerebras-key";
    process.env.GITHUB_MODELS_TOKEN = "test-github-key";

    // Default: all probes fail (fetch returns null / non-ok)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => null),
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  describe("Provider Selection Shape", () => {
    it("should return a provider object with expected fields when probe succeeds", async () => {
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider();

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("model");
      expect(result).toHaveProperty("baseUrl");
      expect(result).toHaveProperty("tier");
    });

    it("should return null when no providers are available", async () => {
      // Remove all API keys
      delete process.env.GROQ_TOKEN;
      delete process.env.MISTRAL_TOKEN;
      delete process.env.GEMINI_TOKEN;
      delete process.env.OPENAI_API_KEY;
      delete process.env.OPENROUTER_TOKEN;
      delete process.env.SAMBANOVA_TOKEN;
      delete process.env.CEREBRAS_TOKEN;
      delete process.env.GITHUB_MODELS_TOKEN;

      // All probes fail (default mock)
      const result = await selectProvider();

      expect(result).toBeNull();
    });
  });

  describe("Preferred Provider Priority", () => {
    it("should skip codex when health state is cooling-down", async () => {
      vi.mocked(getProviderHealthState).mockImplementation((name: string) => {
        if (name === "codex") {
          return { state: "cooling-down", lastUpdated: Date.now() };
        }
        return { state: "healthy", lastUpdated: Date.now() };
      });

      // Groq probe succeeds
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider();

      expect(result).not.toBeNull();
      expect(result!.name).not.toBe("codex");
    });

    it("should skip codex when health state is blocked", async () => {
      vi.mocked(getProviderHealthState).mockImplementation((name: string) => {
        if (name === "codex") {
          return { state: "blocked", lastUpdated: Date.now() };
        }
        return { state: "healthy", lastUpdated: Date.now() };
      });

      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider();

      expect(result).not.toBeNull();
      expect(result!.name).not.toBe("codex");
    });
  });

  describe("Provider Filtering Options", () => {
    it("should restrict to allowedNames when specified", async () => {
      // Make groq and mistral probes succeed
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        if (urlStr.includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ allowedNames: ["mistral"] });

      expect(result).not.toBeNull();
      expect(result!.name).toBe("mistral");
    });

    it("should exclude providers in excludeNames", async () => {
      // Groq probe succeeds, but we exclude it
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        if (urlStr.includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ excludeNames: ["codex", "groq"] });

      expect(result).not.toBeNull();
      expect(result!.name).not.toBe("codex");
      expect(result!.name).not.toBe("groq");
    });

    it("should return null when allowedNames has no available providers", async () => {
      // No probes succeed, restrict to a provider with no key
      delete process.env.SAMBANOVA_TOKEN;

      const result = await selectProvider({ allowedNames: ["sambanova"] });

      expect(result).toBeNull();
    });
  });

  describe("Failure Memory", () => {
    it("should skip providers that recently failed", async () => {
      // Mark groq as recently failed in the state file
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ groq: Math.floor(Date.now() / 1000) }),
      );

      // Groq and mistral probes both succeed
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("api.groq.com")) {
          return { ok: true, text: async () => "llama-3.3-70b-versatile" } as Response;
        }
        if (urlStr.includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ excludeNames: ["codex"] });

      // Groq should be skipped because it recently failed
      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).not.toBe("groq");
      }
    });
  });

  describe("Provider Without Credentials", () => {
    it("should skip providers with no API key configured", async () => {
      delete process.env.GROQ_TOKEN;

      // Mistral probe succeeds
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ excludeNames: ["codex"] });

      expect(result).not.toBeNull();
      expect(result!.name).not.toBe("groq");
    });
  });

  describe("Safety Net Activation", () => {
    it("should activate safety net when all regular providers fail", async () => {
      // Remove all API keys so all cloud providers are skipped
      delete process.env.GROQ_TOKEN;
      delete process.env.MISTRAL_TOKEN;
      delete process.env.GEMINI_TOKEN;
      delete process.env.OPENAI_API_KEY;
      delete process.env.OPENROUTER_TOKEN;
      delete process.env.SAMBANOVA_TOKEN;
      delete process.env.CEREBRAS_TOKEN;
      delete process.env.GITHUB_MODELS_TOKEN;

      // Ollama probe succeeds (safety net)
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("/api/tags")) {
          return {
            ok: true,
            json: async () => ({ models: [{ name: "qwen2.5-coder:3b-instruct" }] }),
          } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider();

      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).toMatch(/^ollama/);
        expect(result.tier).toBe("local-safety-net");
      }
    });

    it("should bypass excludeNames for P0 safety net override", async () => {
      // Remove all API keys
      delete process.env.GROQ_TOKEN;
      delete process.env.MISTRAL_TOKEN;
      delete process.env.GEMINI_TOKEN;
      delete process.env.OPENAI_API_KEY;
      delete process.env.OPENROUTER_TOKEN;
      delete process.env.SAMBANOVA_TOKEN;
      delete process.env.CEREBRAS_TOKEN;
      delete process.env.GITHUB_MODELS_TOKEN;

      // Ollama probe succeeds
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        if (String(url).includes("/api/tags")) {
          return {
            ok: true,
            json: async () => ({ models: [{ name: "qwen2.5-coder:3b-instruct" }] }),
          } as Response;
        }
        return null as unknown as Response;
      });

      // Try to exclude ollama — safety net should override
      const result = await selectProvider({
        excludeNames: ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).toMatch(/^ollama/);
      }
    });
  });

  describe("Probe Response Handling", () => {
    it("should reject provider when probe response does not contain model name", async () => {
      // Groq probe returns wrong model name
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("api.groq.com")) {
          return { ok: true, text: async () => "some-other-model" } as Response;
        }
        if (urlStr.includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ excludeNames: ["codex"] });

      // Groq should be skipped (model not found in response)
      if (result) {
        expect(result.name).not.toBe("groq");
      }
    });

    it("should reject provider when probe returns non-ok response", async () => {
      vi.mocked(fetch).mockImplementation(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("api.groq.com")) {
          return { ok: false, status: 401 } as Response;
        }
        if (urlStr.includes("api.mistral.ai")) {
          return { ok: true, text: async () => "mistral-small-latest" } as Response;
        }
        return null as unknown as Response;
      });

      const result = await selectProvider({ excludeNames: ["codex"] });

      if (result) {
        expect(result.name).not.toBe("groq");
      }
    });
  });
});
