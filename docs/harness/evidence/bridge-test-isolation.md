# Bridge Test Isolation - Port Conflict Resolution

## Problem

Integration tests that spawn bridge servers were experiencing "address already in use" errors when:

1. Production bridges were already running on ports 4318/4319 (via systemd)
2. Multiple test suites ran concurrently
3. Tests were re-run during development without cleaning up previous instances

## Root Cause

Tests were hardcoded to use production ports (4318 for Codebuff, 4319 for Symphony) without checking if those ports were available. When bridges were already running or when tests ran in parallel, port conflicts occurred.

## Solution

Created a test helper utility (`tests/helpers/spawn-test-bridge.ts`) that:

1. **Dynamic Port Allocation**: Finds available ports starting from a preferred port (14318+ for tests)
2. **Automatic Fallback**: If a port is occupied, automatically tries the next port
3. **Process Isolation**: Spawns dedicated bridge instances per test suite
4. **Graceful Cleanup**: Ensures bridges are properly terminated after tests complete

### Key Features

- **Port Range Separation**: Tests use ports 14318+ to avoid conflicts with production bridges on 4318/4319
- **Health Check Waiting**: Polls bridge `/health` endpoint until ready (30s timeout)
- **Log Capture**: Captures stdout/stderr for debugging failed startups
- **Cleanup Guarantees**: SIGTERM with 5s timeout before SIGKILL fallback

## Implementation

### Helper Functions

```typescript
// Spawn isolated Symphony bridge
const bridge = await spawnSymphonyBridge({
  preferredPort: 14319,
  apiKey: "test-symphony",
});

// Spawn isolated Codebuff bridge
const bridge = await spawnCodebuffBridge({
  preferredPort: 14318,
  apiKey: "test-codebuff",
});

// Cleanup after tests
await bridge.cleanup();
```

### Example Test Pattern

```typescript
describe("My Bridge Tests", () => {
  let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>> | null = null;

  beforeAll(async () => {
    bridge = await spawnSymphonyBridge({ preferredPort: 14319 });
  });

  afterAll(async () => {
    await bridge?.cleanup();
  });

  it("should work", async () => {
    const res = await fetch(`${bridge.baseUrl}/health`);
    expect(res.status).toBe(200);
  });
});
```

## Files Created

1. **tests/helpers/spawn-test-bridge.ts** - Core utility for spawning isolated bridges
2. **tests/integration/harness-bridge-isolated.spec.ts** - Example tests using the pattern
3. **tests/helpers/README.md** - Documentation and usage guide

## Benefits

1. **No Port Conflicts**: Tests can run alongside production bridges
2. **Parallel Testing**: Multiple test suites can run concurrently
3. **Fast Iteration**: No need to manually stop bridges between test runs
4. **Better Isolation**: Each test suite gets a clean bridge instance
5. **Debugging Support**: Failed startups include captured logs

## Migration Guide

### Before (Hardcoded Ports)

```typescript
// Assumes bridge already running on 4319
const res = await fetch("http://127.0.0.1:4319/health");
```

### After (Dynamic Ports)

```typescript
let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>>;

beforeAll(async () => {
  bridge = await spawnSymphonyBridge({ preferredPort: 14319 });
});

afterAll(async () => {
  await bridge.cleanup();
});

it("test", async () => {
  const res = await fetch(`${bridge.baseUrl}/health`);
});
```

## Port Allocation Strategy

| Environment        | Symphony Port  | Codebuff Port  | Notes                       |
| ------------------ | -------------- | -------------- | --------------------------- |
| Production         | 4319           | 4318           | Managed by systemd          |
| Tests (base)       | 14319+         | 14318+         | Auto-increments if occupied |
| Tests (concurrent) | 15319+, 16319+ | 15318+, 16318+ | Each suite gets unique port |

## Validation Commands

```bash
# Run isolated bridge tests
npm run test:integration -- harness-bridge-isolated

# Check no port conflicts
lsof -i :14318,14319,15318,15319

# Verify production bridges still accessible
curl http://127.0.0.1:4319/health
curl http://127.0.0.1:4318/health
```

## Related Issues

- Original issue: "address already in use" errors when running integration tests
- Impact: Tests couldn't run in CI/CD or during development without manual intervention
- Resolution: Tests now spawn isolated bridges on dynamic ports with automatic cleanup

## Recommendations

1. **Use for all bridge integration tests** - Provides better isolation than shared bridges
2. **Set higher preferred ports** (15000+) for concurrent test runs
3. **Always use cleanup in afterAll** - Prevents orphaned processes and port leaks
4. **Check logs on failures** - Error messages include captured bridge logs
