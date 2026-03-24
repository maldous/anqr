/**
 * Fake implementations for harness testing
 *
 * Following testing-strategy-anqr-1.0.md:
 * - Fakes implement ports, not convenience mocks
 * - Used for integration tests without real external dependencies
 */
export { FakeBridgeClient } from "./fake-bridge-client";
export { FakeProviderFailureSimulator } from "./fake-provider-failure-simulator";
export { FakeMetricsCollector } from "./fake-metrics-collector";
export { FakeQueueState } from "./fake-queue-state";
export { createHarnessFakes } from "./create-harness-fakes";
