# ANQR Runtime

## 1. Directory Overview

This directory contains runtime-specific harness surfaces for the ANQR (Agentic Number Query Runner) harness. It provides the execution infrastructure for Discord/OpenClaw integration, MCP documentation services, Symphony agent execution, watchdog monitoring, and OpenClaw configuration. The runtime layer bridges the gap between the orchestration logic in `ops/` and the actual execution environments.

## 2. File Summaries

### Subdirectories

| Directory | Purpose |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `discord/` | Discord/OpenClaw bridge utilities (gateway singleton wrapper) to keep wt5-wt8 stable without duplicate advertisers. Implements a leader election pattern using file-based locking to ensure exactly one gateway process across all worktree runners. |
| `mcp/` | Context7 MCP server wrapper (`context7-server.mjs`) and standalone HTTP service (`context7-http-service.mjs`, port 4320). Resolves library documentation via local MCP server with cloud API fallback. |
| `symphony/` | Symphony agent runtime, system prompt, and execution surfaces. Contains the agent runner, tool definitions, and watchdog monitor for bridge health. |

### Root Level Files

- **README.md** - This file.

## 3. Overall Directory Function

This directory serves as the runtime execution layer for the ANQR harness. The components work together as follows:

1. **Discord Integration (discord/)**: The OpenClaw gateway singleton wrapper uses file-based locking to ensure exactly one gateway process runs across all worktree runners. The owner spawns and monitors the gateway, while followers wait passively. This prevents duplicate advertisers that would cause instability in worktrees wt5-wt8.

2. **Documentation Resolution (mcp/)**: The Context7 MCP server wrapper spawns a local MCP server as a child process and communicates via JSON-RPC 2.0 over stdio. When the local server is unavailable, it falls back to the Context7 cloud API. The HTTP service exposes this on port 4320 so the Symphony Bridge can resolve documentation without spawning its own MCP process.

3. **Agent Execution (symphony/)**: The Symphony agent runtime provides the core agent loop with tool execution capabilities. It supports reading files, listing directories, patching files, deleting files, writing files, and running commands (typecheck, lint, tests, AST density, cspell). The watchdog monitor checks bridge health and can trigger automatic rollback on catastrophic failures.

## 4. Usage Instructions

### Discord Gateway Singleton

Typically not run directly; imported by other harness modules:

```js
import { startGateway, stopGateway } from "./discord/openclaw-gateway-singleton.mjs";
```

Environment variables control behavior:
- `ANQR_WORKTREE_ID` - Worktree identifier
- `ANQR_WORKTREE_PATH` - Worktree directory path
- `OPENCLAW_GATEWAY_HOST/PORT` - Gateway bind (default 127.0.0.1:18789)

### MCP Documentation Resolution

```js
import { startContext7Server, resolveDocsLocally, isContext7ServerHealthy } from "./mcp/context7-server.mjs";

// Start server, resolve docs, stop when done
await startContext7Server();
const docs = await resolveDocsLocally({ libraryTitle: "React", topic: "hooks" });
await stopContext7Server();
```

Or run as HTTP service:
```bash
curl http://127.0.0.1:4320/health
curl -X POST http://127.0.0.1:4320/v1/resolve-docs \
  -H "Content-Type: application/json" \
  -d '{"libraryTitle": "React", "topic": "hooks"}'
```

### Symphony Agent

```js
import { runAgent } from "./symphony/symphony-agent.mjs";
import { startWatchdogMonitor, stopWatchdogMonitor } from "./symphony/watchdog-monitor.mjs";

// Start watchdog to monitor bridge health
await startWatchdogMonitor();

// Run agent with issue context
const result = await runAgent({
  issueId: "LIN-123",
  instruction: "Fix the bug in foo.ts",
});

// Stop watchdog when done
await stopWatchdogMonitor();
```

### OpenClaw Configuration

Copy to live deployment:
```bash
cp -r ops/runtime/openclaw-config/* ~/.openclaw/
# Replace CHANGEME placeholders with real values
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **@upstash/context7-mcp** - Context7 MCP server (spawned via npx)
- **Vitest** - For test execution

### Internal Dependencies

- **../../lib/logger.mjs** - Shared logging module
- **../../symphony-config.mjs** - Configuration constants

### External Services

- **Discord Bot** - Voice and text channel integration
- **Context7 Cloud API** - Fallback documentation resolution
- **Symphony Bridge** - Running at http://127.0.0.1:18790/v1
- **OpenClaw Gateway** - Running at http://127.0.0.1:18789
- **Ollama** - Optional local model provider at localhost:11434

### Environment Variables

| Variable | Purpose |
| -------- | ------- |
| `ANQR_WORKTREE_ID` | Worktree identifier |
| `OPENCLAW_GATEWAY_PORT` | Gateway port (default 18789) |
| `CONTEXT7_API_KEY` | Context7 cloud API key |
| `CONTEXT7_HTTP_URL` | MCP HTTP service URL |
| `SYMPHONY_BRIDGE_URL` | Bridge API endpoint |

## 6. Additional Comments

- **Singleton Pattern**: The Discord gateway uses file-based locking to ensure exactly one gateway across all worktrees. This prevents the instability caused by duplicate advertisers in wt5-wt8.

- **MCP Fallback Strategy**: The Context7 resolution first attempts the local MCP server, then falls back to the cloud API. This ensures documentation availability even when the local server is unavailable.

- **Watchdog Recovery**: The watchdog monitor can trigger automatic git rollback and restart when it detects catastrophic errors or rapid restart patterns. This provides self-healing capability for the bridge.

- **Protocol Versions**: The MCP wrapper implements protocol version "2024-11-05" and sends initialization notifications after handshake completion.

- **Systemd Integration**: The MCP HTTP service can be run as a systemd user service for persistent operation, allowing other services to resolve documentation without managing their own MCP lifecycle.