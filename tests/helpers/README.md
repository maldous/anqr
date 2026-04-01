# Test Helpers

## Bridge Spawning for Tests

### Problem

Integration tests that interact with Symphony or Codebuff bridges can encounter "address already in use" errors when:

- Production bridges are already running on port 4319+ (via systemd)
- Multiple test suites run concurrently
- Tests are run repeatedly during development

### Solution

Use `spawn-test-bridge.ts` to spawn isolated bridge instances on dynamic ports for each test suite.

### Usage

#### Basic Example

```typescript
import { describe, it, beforeAll, afterAll } from "vitest";
import { spawnSymphonyBridge } from "../helpers/spawn-test-bridge";

describe("My Symphony Tests", () => {
  let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>> | null = null;

  beforeAll(async () => {
    // Spawn isolated bridge on dynamic port
    bridge = await spawnSymphonyBridge({
      preferredPort: 14319, // Fallback to next available if occupied
      apiKey: "test-key",
    });
  });

  afterAll(async () => {
    // Clean up bridge process
    await bridge?.cleanup();
  });

  it("should work", async () => {
    const res = await fetch(`${bridge.baseUrl}/health`);
    expect(res.status).toBe(200);
  });
});
```

#### Multiple Bridges

```typescript
import { spawnSymphonyBridge, spawnCodebuffBridge } from "../helpers/spawn-test-bridge";

let symphonyBridge: Awaited<ReturnType<typeof spawnSymphonyBridge>>;
let codebuffBridge: Awaited<ReturnType<typeof spawnCodebuffBridge>>;

beforeAll(async () => {
  // Spawn both bridges concurrently
  [symphonyBridge, codebuffBridge] = await Promise.all([
    spawnSymphonyBridge({ preferredPort: 15319 }),
    spawnCodebuffBridge({ preferredPort: 15318 }),
  ]);
});

afterAll(async () => {
  await Promise.all([symphonyBridge.cleanup(), codebuffBridge.cleanup()]);
});
```

#### Custom Environment

```typescript
const bridge = await spawnSymphonyBridge({
  preferredPort: 14319,
  apiKey: "custom-key",
  env: {
    GROQ_TOKEN: "test-token",
    RUNNER_OLLAMA_MODEL: "qwen3-coder-next:latest",
  },
});
```

### API

#### `spawnSymphonyBridge(options?)`

Spawns a Symphony bridge instance on a dynamic port.

**Options:**

- `preferredPort?: number` - Starting port (default: 14319). Will increment if occupied.
- `apiKey?: string` - API key for authentication (default: "test-symphony")
- `env?: Record<string, string>` - Additional environment variables

**Returns:**

```typescript
{
  process: ChildProcess; // Node.js process
  port: number; // Actual port assigned
  baseUrl: string; // "http://127.0.0.1:{port}"
  apiKey: string; // API key for auth headers
  cleanup: () => Promise<void>; // Stop the bridge
}
```

#### `spawnCodebuffBridge(options?)`

**DEPRECATED:** The standalone Codebuff bridge has been retired (ADR-0003). Codebuff SDK now runs inside each worktree-local Symphony bridge.

### Port Ranges

- **Production**: 4319 (Symphony router), 4321-4328 (worktree bridges)
- **Tests**: 14319+ (Symphony)
- **Concurrent tests**: 15319+, 16319+, etc.

### Cleanup

**Always** call `cleanup()` in `afterAll()` to prevent:

- Orphaned bridge processes
- Port leaks
- Resource exhaustion

```typescript
afterAll(async () => {
  await bridge?.cleanup();
});
```

The cleanup function:

1. Sends SIGTERM to bridge process
2. Waits for graceful shutdown
3. Force-kills (SIGKILL) after 5 seconds if needed

### Debugging

Bridge logs are captured in the spawned process. If a bridge fails to start, the error message includes the captured logs:

```
Error: Symphony bridge failed to start on port 14319. Logs:
[bridge startup logs here]
```

### Example Test Files

- `tests/integration/harness-bridge-isolated.spec.ts` - Full example with Symphony, Codebuff, and concurrent bridges
