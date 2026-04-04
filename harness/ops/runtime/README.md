# Contract

Runtime-specific harness surfaces.

## Subdirectories

| Directory   | Purpose                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `discord/`  | Discord/OpenClaw bridge utilities (gateway singleton wrapper) to keep wt5-wt8 stable without duplicate advertisers.                                                                                    |
| `mcp/`      | Context7 MCP server wrapper (`context7-server.mjs`) and standalone HTTP service (`context7-http-service.mjs`, port 4320). Resolves library documentation via local MCP server with cloud API fallback. |
| `symphony/` | Symphony agent runtime, system prompt, and execution surfaces.                                                                                                                                         |
