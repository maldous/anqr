import { beforeEach, describe, expect, it, vi } from "vitest";

const mockShouldRetryProvider = vi.fn();
const mockRecordProviderHealthFailure = vi.fn();
const mockRecordProviderHealthSuccess = vi.fn();
const mockProbeProviderDetailed = vi.fn();
const mockShuffleArray = vi.fn((items) => items);
const mockGetProviderDefinitions = vi.fn();
const mockGetRankedProviders = vi.fn();
const mockProbeToolCapabilityForProvider = vi.fn();

vi.mock("./symphony-provider-health.mjs", () => ({
  shouldRetryProvider: mockShouldRetryProvider,
  recordProviderHealthFailure: mockRecordProviderHealthFailure,
  recordProviderHealthSuccess: mockRecordProviderHealthSuccess,
}));

vi.mock("./symphony-credit-gate/providers.mjs", () => ({
  PROVIDERS: [
    {
      name: "alpha",
      model: "alpha-model",
      baseUrl: "https://alpha.example.com",
    },
  ],
}));

vi.mock("./symphony-credit-gate/probe-provider-detailed.mjs", () => ({
  probeProviderDetailed: mockProbeProviderDetailed,
}));

vi.mock("./symphony-credit-gate/shuffle-array.mjs", () => ({
  shuffleArray: mockShuffleArray,
}));

vi.mock("./symphony-credit-gate.mjs", () => ({
  getProviderDefinitions: mockGetProviderDefinitions,
  getRankedProviders: mockGetRankedProviders,
}));

vi.mock("./symphony-openai-bridge/probe-tool-capability-for-provider.mjs", () => ({
  probeToolCapabilityForProvider: mockProbeToolCapabilityForProvider,
}));

vi.mock("./symphony-openai-bridge/provider-status-cache.mjs", () => ({
  providerStatusCache: {
    probeResults: [{ name: "alpha", available: true, status: "available", durationMs: 10 }],
  },
}));

vi.mock("./symphony-openai-bridge/bridge-provider-blocklist.mjs", () => ({
  BRIDGE_PROVIDER_BLOCKLIST: new Set(),
}));

vi.mock("./symphony-openai-bridge/get-provider-gateway.mjs", () => ({
  getProviderGateway: vi.fn(() => "alpha"),
}));

vi.mock("./symphony-openai-bridge/probe-gateway-batched.mjs", () => ({
  probeGatewayBatched: vi.fn(),
}));

vi.mock("./symphony-openai-bridge/gateway-batch-size.mjs", () => ({
  GATEWAY_BATCH_SIZE: 10,
}));

vi.mock("./symphony-openai-bridge/gateway-batch-delay-ms.mjs", () => ({
  GATEWAY_BATCH_DELAY_MS: 0,
}));

vi.mock("./symphony-openai-bridge/tool-probe-retry-delay-ms.mjs", () => ({
  TOOL_PROBE_RETRY_DELAY_MS: 1_000,
}));

vi.mock("./symphony-openai-bridge/tool-capable-providers.mjs", () => ({
  toolCapableProviders: new Set(),
}));

vi.mock("./symphony-openai-bridge/non-tool-capable-providers.mjs", () => ({
  nonToolCapableProviders: new Set(),
}));

vi.mock("./symphony-openai-bridge/tool-probe-retry-scheduled.mjs", () => ({
  toolProbeRetryScheduled: true,
  setToolProbeRetryScheduled: vi.fn(),
}));

vi.mock("./symphony-credit-gate/logger.mjs", () => ({
  logDebug: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("./symphony-openai-bridge/logger.mjs", () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

describe("startup probe bootstrap mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShouldRetryProvider.mockReturnValue(false);
    mockGetProviderDefinitions.mockReturnValue([
      {
        name: "alpha",
        model: "alpha-model",
      },
    ]);
    mockGetRankedProviders.mockReturnValue([{ name: "alpha" }]);
    mockProbeToolCapabilityForProvider.mockResolvedValue({
      name: "alpha",
      status: "tool-capable",
    });
  });

  it("probes through cooldown during bootstrap without recording failure state", async () => {
    mockProbeProviderDetailed.mockRejectedValue(new Error("timed out"));
    const { probeAllProviders } = await import("./symphony-credit-gate/probe-all-providers.mjs");

    const results = await probeAllProviders({
      respectHealthState: false,
      recordHealthFailures: false,
    });

    expect(mockProbeProviderDetailed).toHaveBeenCalledOnce();
    expect(mockRecordProviderHealthFailure).not.toHaveBeenCalled();
    expect(results).toEqual([
      expect.objectContaining({
        name: "alpha",
        status: "probe_error",
        available: false,
      }),
    ]);
  });

  it("still respects cooldown in runtime probe mode", async () => {
    const { probeAllProviders } = await import("./symphony-credit-gate/probe-all-providers.mjs");

    const results = await probeAllProviders();

    expect(mockProbeProviderDetailed).not.toHaveBeenCalled();
    expect(results).toEqual([
      expect.objectContaining({
        name: "alpha",
        status: "cooling_down",
        available: false,
      }),
    ]);
  });

  it("probes tool capability for reachable providers during bootstrap even if health says cooldown", async () => {
    const { probeAllToolCapability } =
      await import("./symphony-openai-bridge/probe-all-tool-capability.mjs");

    await probeAllToolCapability({ respectHealthState: false });

    expect(mockProbeToolCapabilityForProvider).toHaveBeenCalledOnce();
    expect(mockProbeToolCapabilityForProvider).toHaveBeenCalledWith(
      expect.objectContaining({ name: "alpha" }),
    );
  });
});
