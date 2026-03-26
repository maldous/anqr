# Service Restart Notification Utility

Provides consistent restart/shutdown notifications for all ANQR services.

## Features

- **Discord webhook notifications** with service status, PID, commit info, and metadata
- **MEMORY.md updates** for audit trail
- **Consistent formatting** across all services
- **Active request warnings** when shutting down with in-flight requests

## Usage

### Basic Example (Symphony Bridge)

```javascript
import { notifyServiceRestart, notifyServiceShutdown } from "./service-restart-notify.mjs";

// On startup
server.listen(PORT, async () => {
  await notifyServiceRestart({
    serviceName: "Symphony Bridge",
    port: 4319,
    metadata: {
      Model: "symphony/main",
      Providers: "38/38 available",
      Tools: "read, write, exec, glob, memory_search, memory_get",
    },
  });
});

// On shutdown
async function shutdown(signal) {
  await notifyServiceShutdown({
    serviceName: "Symphony Bridge",
    signal,
    metadata: {
      Providers: "38/38 available",
    },
    activeRequests: activeRequests.size,
  });
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### Codebuff Bridge Example

```javascript
import { notifyServiceRestart, notifyServiceShutdown } from "../../lib/service-restart-notify.mjs";

// On startup
server.listen(PORT, async () => {
  await notifyServiceRestart({
    serviceName: "Codebuff Bridge",
    port: 4318,
    metadata: {
      Model: "codebuff/base",
      Mode: "paid",
      "API Key": "configured",
    },
  });
});

// On shutdown
async function shutdown(signal) {
  await notifyServiceShutdown({
    serviceName: "Codebuff Bridge",
    signal,
    metadata: {
      Mode: "paid",
    },
  });
  process.exit(0);
}
```

### OpenClaw Gateway Example

If you're implementing an OpenClaw Gateway wrapper or monitoring service:

```javascript
import { notifyServiceRestart, notifyServiceShutdown } from "./service-restart-notify.mjs";

// On startup
gateway.listen(PORT, async () => {
  await notifyServiceRestart({
    serviceName: "OpenClaw Gateway",
    port: 18789,
    metadata: {
      Mode: "local",
      Auth: "token",
      Tools: "message, memory_get, read, write, exec",
    },
  });
});

// On shutdown
async function shutdown(signal) {
  await notifyServiceShutdown({
    serviceName: "OpenClaw Gateway",
    signal,
    metadata: {
      Port: 18789,
      "Active Sessions": activeSessions.size,
    },
    activeRequests: activeConnections.size,
  });
  process.exit(0);
}
```

### Watchdog/Monitoring Service Example

```javascript
import { notifyServiceRestart, notifyServiceShutdown } from "../../lib/service-restart-notify.mjs";

// On startup
async function startWatchdog() {
  await notifyServiceRestart({
    serviceName: "Bridge Watchdog",
    metadata: {
      "Monitored Services": "symphony-bridge, codebuff-bridge",
      "Check Interval": "60s",
      "Grace Period": "60s",
    },
  });

  // Start monitoring loop...
}

// On shutdown
async function shutdown(signal) {
  await notifyServiceShutdown({
    serviceName: "Bridge Watchdog",
    signal,
    metadata: {
      Uptime: formatElapsed(Date.now() - startTime),
    },
  });
  process.exit(0);
}
```

## API Reference

### `notifyServiceRestart(options)`

Send notifications when a service starts or restarts.

**Parameters:**

- `options.serviceName` (string, required) - Human-readable service name
- `options.port` (number, optional) - Service port number
- `options.metadata` (object, optional) - Additional metadata as key-value pairs
- `options.cwd` (string, optional) - Working directory for git commands (defaults to `process.cwd()`)

**Example metadata keys:**

- `Model`, `Mode`, `Providers`, `Tools`, `API Key`, `Auth`, etc.

### `notifyServiceShutdown(options)`

Send notifications when a service shuts down.

**Parameters:**

- `options.serviceName` (string, required) - Human-readable service name
- `options.signal` (string, required) - Signal that triggered shutdown (e.g., "SIGTERM", "SIGINT")
- `options.metadata` (object, optional) - Additional metadata as key-value pairs
- `options.activeRequests` (number, optional) - Number of active requests being terminated
- `options.cwd` (string, optional) - Working directory for git commands (defaults to `process.cwd()`)

## Discord Notification Format

### Restart Notification (Green)

```
🚀 Symphony Bridge Started
PID 123456

Port: 4319
PID: 123456
Commit: abc1234: feat(harness): add dynamic context limits
Model: symphony/main
Providers: 38/38 available
Tools: read, write, exec, glob, memory_search, memory_get
Details: Implements per-provider context limits with tool overhead accounting...
```

### Shutdown Notification (Orange)

```
⚠️ Symphony Bridge Restarting
**Service interruption in progress**

The service is shutting down and will restart momentarily.

Signal: SIGTERM
PID: 123456
Commit: abc1234
Providers: 38/38 available
Active Requests: ⚠️ 3 in-flight

⚠️ Active requests will be terminated
```

## MEMORY.md Format

Restart:

```
### 2026-03-26 - Symphony Bridge restarted successfully (PID 123456, commit abc1234, Model: symphony/main, Providers: 38/38 available)
```

Shutdown:

```
### 2026-03-26 - Symphony Bridge stopped (PID 123456, commit abc1234, Providers: 38/38 available, signal: SIGTERM)
```

## Best Practices

1. **Always call on startup** - Even if the service is not being restarted, call `notifyServiceRestart` to establish a clear audit trail
2. **Include relevant metadata** - Provide context-specific metadata that helps diagnose issues (providers, mode, configuration, etc.)
3. **Track active requests** - Pass `activeRequests` count to warn about terminated connections
4. **Use consistent service names** - Use the same `serviceName` across restart and shutdown to enable correlation
5. **Handle errors gracefully** - The notification functions catch and log errors to prevent service startup/shutdown from failing

## Integration Checklist

When adding restart notifications to a service:

- [ ] Import `notifyServiceRestart` and `notifyServiceShutdown`
- [ ] Call `notifyServiceRestart` in the startup handler (after `server.listen`)
- [ ] Call `notifyServiceShutdown` in signal handlers (SIGTERM, SIGINT)
- [ ] Include service-specific metadata (port, mode, providers, etc.)
- [ ] Pass active request count to `notifyServiceShutdown` if applicable
- [ ] Update `knowledge.md` to document the service in the restart procedure section
- [ ] Test notifications by restarting the service: `systemctl --user restart <service-name>`

## Services Using This Utility

Current services with restart notifications:

- **Symphony Bridge** (`anqr-symphony-bridge`) - AI provider routing and tool execution
- **Codebuff Bridge** (`anqr-codebuff-bridge`) - Codebuff SDK wrapper with paid→free fallback
- **OpenClaw Gateway** (external) - OpenClaw AI agent gateway (not a systemd service in this repo)

Services that should add notifications:

- Bridge Watchdog (`anqr-watchdog`) - Monitors and auto-recovers bridge failures
- Queue Feeder (`anqr-queue-feeder`) - Maintains Symphony task queue
- Symphony Runner (`anqr-symphony-runner`) - Executes Linear issues via AI agents
- Email Ingest (`anqr-email-ingest`) - Converts emails to Linear issues
- Nightly Ops (`anqr-nightly`) - Runs nightly maintenance tasks

## See Also

- `scripts/ops/lib/update-memory.mjs` - MEMORY.md update utility (used internally)
- `scripts/ops/integrations/notifications/discord-webhook.mjs` - Discord webhook integration
- `knowledge.md` - Full service restart procedure documentation
