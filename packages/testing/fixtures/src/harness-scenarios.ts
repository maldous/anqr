/**
 * Test fixtures for harness integration tests
 *
 * Following testing-strategy-anqr-1.0.md:
 * - Fixtures are immutable and named by scenario
 * - Describe business or runtime behavior, not implementation details
 * - Used by contract tests, integration tests, and E2E scenarios
 */

// Symphony Bridge test messages
export const symphonyTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok' if you can read this." }],
    model: "symphony/main",
    stream: false,
  },

  codexModel: {
    messages: [{ role: "user" as const, content: "List the files in the current directory." }],
    model: "symphony/codex",
    stream: false,
  },

  groqFallback: {
    messages: [{ role: "user" as const, content: "What is 2 + 2?" }],
    model: "symphony/groq",
    stream: false,
  },

  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count from 1 to 5." }],
    model: "symphony/main",
    stream: true,
  },

  withIssueContext: {
    messages: [
      {
        role: "user" as const,
        content: `## Issue: ANQR-747 — Implement harness integration tests

Please write a simple test file that returns "ok".`,
      },
    ],
    model: "symphony/main",
    stream: false,
  },

  toolExecutionRead: {
    messages: [
      {
        role: "user" as const,
        content:
          "Read the package.json file in the current directory and tell me the project name.",
      },
    ],
    model: "symphony/main",
    stream: false,
  },

  toolExecutionExec: {
    messages: [
      {
        role: "user" as const,
        content: "Run 'echo hello' and return the output.",
      },
    ],
    model: "symphony/main",
    stream: false,
  },

  toolExecutionGlob: {
    messages: [
      {
        role: "user" as const,
        content: "Find all .ts files in the packages directory.",
      },
    ],
    model: "symphony/main",
    stream: false,
  },
} as const;

// Codebuff Bridge test messages
export const codebuffTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok'." }],
    model: "codebuff/base",
    stream: false,
  },

  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count to 3." }],
    model: "codebuff/base",
    stream: true,
  },

  complexTask: {
    messages: [
      {
        role: "user" as const,
        content: `## Issue: TEST-001 — Test issue

Create a simple file called test-output.txt with the content "test".

Then delete it.`,
      },
    ],
    model: "codebuff/base",
    stream: false,
  },
} as const;

// Provider selection test scenarios
export const providerSelectionScenarios = {
  noRestrictions: {
    allowedNames: null,
    excludeNames: [],
  },

  codexOnly: {
    allowedNames: ["codex"],
    excludeNames: [],
  },

  excludeOllama: {
    allowedNames: null,
    excludeNames: ["ollama-local"],
  },

  freeProvidersOnly: {
    allowedNames: ["groq", "gemini", "openrouter-free"],
    excludeNames: [],
  },
} as const;

// Expected provider fallback order (best to worst)
export const expectedProviderOrder = [
  "codex",
  "codebuff",
  "groq",
  "mistral",
  "gemini",
  "gemini-lite",
  // OpenRouter models...
  "sambanova",
  "cerebras",
  "github-models",
  "codebuff-bridge",
  "ollama-local",
] as const;

// OpenClaw model configuration
export const openclawModelConfig = {
  primaryModel: "symphony-bridge/symphony/main",
  fallbackModels: [
    "symphony-bridge/symphony/codex",
    "symphony-bridge/symphony/codebuff",
    "symphony-bridge/symphony/codebuff-bridge",
    "symphony-bridge/symphony/groq",
    "symphony-bridge/symphony/mistral",
    "symphony-bridge/symphony/gemini",
    "symphony-bridge/symphony/gemini-lite",
    "symphony-bridge/symphony/openrouter",
    "symphony-bridge/symphony/sambanova",
    "symphony-bridge/symphony/cerebras",
    "symphony-bridge/symphony/ollama-local",
    "codebuff-bridge/codebuff/base",
  ],
} as const;

// Error scenarios for negative testing
export const errorScenarios = {
  noApiKey: {
    description: "Request without authorization header",
    headers: {},
    expectedStatus: 401,
  },

  invalidModel: {
    description: "Request with non-existent model",
    body: {
      model: "non-existent-model",
      messages: [{ role: "user" as const, content: "test" }],
    },
    expectedStatus: 200, // Bridge may fallback to default
  },

  malformedJson: {
    description: "Request with malformed JSON body",
    rawBody: "{ not valid json",
    expectedStatus: 400,
  },

  emptyMessages: {
    description: "Request with empty messages array",
    body: {
      model: "symphony/main",
      messages: [],
    },
    expectedStatus: 200, // May still work with empty context
  },

  oversizedBody: {
    description: "Request body exceeds size limit",
    body: {
      model: "symphony/main",
      messages: [{ role: "user" as const, content: "x".repeat(6 * 1024 * 1024) }],
    },
    expectedStatus: 413, // Payload too large
  },
} as const;

// Expected metrics after operations
export const expectedMetrics = {
  afterSingleRequest: {
    totalRequests: 1,
    totalFallbacks: 0,
    totalErrors: 0,
  },

  afterFallbackRequest: {
    totalRequests: 1,
    totalFallbacks: 1,
    totalErrors: 0,
  },

  afterError: {
    totalRequests: 1,
    totalErrors: 1,
  },
} as const;

// Credit gate expected behaviors
export const creditGateScenarios = {
  successAfterSelection: {
    description: "Provider successfully selected and used",
    expectedProviderCount: 1,
    expectedSuccess: true,
  },

  fallbackAfterFailure: {
    description: "Fallback triggered after primary provider fails",
    simulateFailure: true,
    expectedFallbackCount: 1,
  },

  cooldownAfterRepeatedFailures: {
    description: "Provider put in cooldown after repeated failures",
    failureCount: 3,
    expectedCooldown: true,
  },
} as const;
