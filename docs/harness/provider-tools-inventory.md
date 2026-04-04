# Provider Tools Inventory

## Overview

This document catalogs all tools used by the AI providers in the Symphony bridge ecosystem. Each provider has different tool capabilities that must be supported by the Symphony bridge for OpenClaw compatibility.

**Last Updated**: 2026-03-30 (Documented ANQR-native Context7 + hybrid/Linear RAG preference)

---

## 1. Symphony Bridge Tools (AI SDK)

**Location**: `harness/ops/integrations/model/symphony-openai-bridge.mjs:664-980`

These are the **currently implemented** tools in the Symphony bridge using the AI SDK `tool()` function:

### Implemented (12 tools)

1. **`exec`** - Execute a shell command and return the output
   - Schema: `{ command: string, cwd?: string }`
   - Use: Run terminal commands within project context

2. **`read`** - Read a file from the filesystem
   - Schema: `{ path: string, offset?: number, lines?: number }`
   - Use: Read file content with optional line range

3. **`write`** - Write content to a file
   - Schema: `{ path: string, content: string }`
   - Use: Create or overwrite files

4. **`glob`** - Find files matching a glob pattern
   - Schema: `{ pattern: string, cwd?: string }`
   - Use: File discovery and pattern matching

5. **`memory_search`** - Search through memory and knowledge files
   - Schema: `{ query: string }`
   - Use: Search MEMORY.md and knowledge.md

6. **`memory_get`** - Get full content of a memory or knowledge file
   - Schema: `{ file?: "MEMORY.md" | "knowledge.md" | "CLAUDE.md" }`
   - Use: Retrieve complete memory files

7. **`run_file_change_hooks`** - Execute file change hooks for modified files
   - Schema: `{ files: string[] }`
   - Use: Run validation hooks after file changes

8. **`think_deeply`** - Deep reasoning for complex tasks
   - Schema: `{ thought: string }`
   - Use: Step-by-step analysis and brainstorming

9. **`update_subgoal`** - Update subgoal status and progress
   - Schema: `{ id: string, status?: string, log?: string, plan?: string }`
   - Use: Track multi-step task progress

10. **`add_subgoal`** - Add new subgoal for complex requests
    - Schema: `{ id: string, objective: string, status?: string, log?: string, plan?: string }`
    - Use: Create task tracking subgoals

11. **`find_files`** - Natural language file search
    - Schema: `{ prompt: string }`
    - Use: Find files by description or function/class name
    - Implementation: local hybrid search (BM25 + semantic embeddings/RAG when available), then basic fallback

12. **`web_search`** - Web search capability via Linkup API
    - Schema: `{ query: string, depth?: "standard" | "deep" }`
    - Use: Search web for current information
    - Requires: `LINKUP_API_KEY` or `WEB_SEARCH_API_KEY` environment variable

13. **`read_docs`** - Library documentation via Context7 API
    - Schema: `{ libraryTitle: string, topic: string, max_tokens?: number }`
    - Use: Fetch up-to-date library/framework documentation
    - Implementation: local Context7 MCP/HTTP service first, cloud Context7 fallback second
    - Cloud fallback requires: `CONTEXT7_API_KEY` or `DOCS_API_KEY`

14. **`file_search`** - Compatibility retrieval wrapper
    - Schema: `{ query?: string, pattern?: string, prompt?: string }`
    - Use: Route exact searches to `code_search` and natural-language discovery to `find_files`
    - Role: preferred compatibility entrypoint for RAG-style retrieval requests

15. **`search_linear_issues`** - Local Linear issue retrieval
    - Schema: `{ query: string, limit?: number }`
    - Use: Search exported/indexed ANQR Linear issues from the local Linear RAG index
    - Role: preferred fast path for prior issue context before direct Linear API inspection

---

## 2. Codebuff SDK Tools (Internal)

**Location**: Handled internally by Codebuff SDK, tracked in `codebuff-openai-bridge.mjs:490-520`

These tools are **internal to Codebuff** and managed by the SDK. They should NOT be exposed as external tools in bridges:

### SDK-Internal Tools

1. **`set_messages`** - Set conversation history (SDK internal)
2. **`set_output`** - Set agent output (SDK internal)
3. **`end_turn`** - Signal turn completion (SDK internal)
4. **`spawn_agent_inline`** - Spawn sub-agents (SDK internal)
5. **`update_subgoal`** - Update task subgoal status (SDK internal)
6. **`add_subgoal`** - Add new task subgoal (SDK internal)
7. **`context-pruner`** - Prune conversation context (SDK internal)

**Note**: These are tracked for display formatting in `formatToolCallDisplay()` but are NOT executable tools for external clients.

---

## 3. OpenClaw Allowed Tools

**Location**: `.openclaw/models.json` and `.openclaw/openclaw.json`

These tools are defined in OpenClaw's configuration as allowed for agents:

### OpenClaw Tool Set (25+ tools)

1. **`browser`** - Browser automation
2. **`canvas`** - Canvas manipulation
3. **`message`** - Send messages
4. **`gateway`** - Gateway operations
5. **`nodes`** - Node operations
6. **`agents_list`** - List available agents
7. **`tts`** - Text-to-speech
8. **`read`** - Read files
9. **`write`** - Write files
10. **`edit`** - Edit files
11. **`apply_patch`** - Apply file patches
12. **`exec`** - Execute commands
13. **`process`** - Process management
14. **`web_search`** - Web search
15. **`web_fetch`** - Fetch web content
16. **`memory_search`** - Search memory
17. **`memory_get`** - Get memory content
18. **`sessions_spawn`** - Spawn sessions
19. **`sessions_yield`** - Yield sessions
20. **`subagents`** - Subagent management
21. **`cron`** - Scheduled tasks
22. **`image`** - Image operations
23. **`spawn_agents`** - Spawn multiple agents
24. **`spawn_agent_inline`** - Spawn inline agent
25. **`think_deeply`** - Deep reasoning
26. **`thinker`** - Thinking operations

---

## 4. Symphony Agent Tools (Autonomous Runner)

**Location**: `harness/ops/runtime/symphony/symphony-agent.mjs:93-180`

These tools are used by the Symphony autonomous agent runner for Linear issue implementation:

### Symphony Runner Tools (12 tools)

1. **`read_file`** - Read a file from the project
2. **`write_file`** - Write or create a file
3. **`delete_file`** - Delete a file or directory
4. **`patch_file`** - Make targeted edits via search/replace
5. **`run_command`** - Run allowlisted read-only commands
6. **`list_directory`** - List directory contents
7. **`run_typecheck`** - Run TypeScript compiler (tsc --noEmit)
8. **`run_lint`** - Run linter (oxlint)
9. **`run_cspell`** - Run spell checker
10. **`run_ast_density`** - Run AST density audit
11. **`run_tests`** - Run unit test suite
12. **`task_complete`** - Signal task completion

---

## 5. Codebuff Agent Type Definitions

**Location**: `.agents/types/tools.types.ts`

These are the **type definitions** for tools that Codebuff agents can use. Many are SDK-internal:

### Full Codebuff Tool Type Set (28 tools)

1. `add_message` - Add message to conversation history
2. `apply_patch` - Apply Codex-style file operations
3. `ask_user` - Ask multiple choice questions
4. `code_search` - Search for patterns using ripgrep
5. `end_turn` - End current turn
6. `find_files` - Find files by natural language description
7. `glob` - Search files by glob pattern
8. `list_directory` - List directory contents
9. `lookup_agent_info` - Retrieve agent metadata
10. `propose_str_replace` - Propose string replacements (preview only)
11. `propose_write_file` - Propose file write (preview only)
12. `read_docs` - Fetch library documentation via Context7
13. `read_files` - Read multiple files
14. `read_subtree` - Read directory subtrees with parsed variables
15. `run_file_change_hooks` - Execute file change hooks
16. `run_terminal_command` - Execute CLI commands
17. `set_messages` - Set conversation history
18. `set_output` - Set agent output (JSON)
19. `skill` - Load skill instructions
20. `spawn_agents` - Spawn multiple agents in parallel
21. `str_replace` - Replace strings in files
22. `suggest_followups` - Suggest followup prompts
23. `task_completed` - Signal task completion
24. `think_deeply` - Deep reasoning
25. `web_search` - Search web via Linkup API
26. `write_file` - Create or edit files
27. `write_todos` - Write task list
28. `update_subgoal` / `add_subgoal` - Subgoal management (SDK internal)

---

## 6. MCP (Model Context Protocol) Tools

**Location**: `packages/contracts/mcp/src/` and `packages/platform/node/src/mcp/tools/`

These tools are exposed via the MCP server for QR code generation:

### MCP Tools (2 tools)

1. **`generate_qr`** - Basic QR code generation
   - Schema: `qr-generate-tool.contract.ts`
   - Parameters: data, size, errorCorrection, foreground, background, format, margin

2. **`generate_qr_advanced`** - Advanced QR code generation
   - Schema: `qr-generate-advanced-tool.contract.ts`
   - Parameters: 100+ advanced styling and animation options

---

## Tool Coverage Gap Analysis

### Native-first usage guidance

Agents should use the bridge tools in this order when possible:

1. `read_docs` for library/framework questions
2. `search_linear_issues` for prior ANQR issue history and decision context
3. `find_files` or `file_search` for repository discovery
4. `code_search` for exact symbol/string matching inside narrowed files
5. `web_search` only for current external information or when local context is insufficient

This reflects the ANQR harness posture: prefer local Context7 and local hybrid/Linear RAG retrieval before internet search or wide repository scans.

### Missing from Symphony Bridge

The following tools are defined in type systems but **NOT implemented** in Symphony bridge:

1. **`ask_user`** - Interactive user prompts (OpenClaw-specific, not applicable to bridge)
2. **`read_subtree`** - Directory tree with parsed variables (advanced, low priority)
3. **`apply_patch`** - Codex-style patches (Codebuff SDK handles this internally)
4. **`message`**, **`browser`**, **`canvas`**, **`sessions_*`** - OpenClaw-specific tools

### Recently Implemented (2026-03-27)

**✅ Completed - Priority 1 tools**:

- `run_file_change_hooks` - Executes file change hooks after modifications
- `think_deeply` - Deep reasoning for complex tasks
- `update_subgoal` / `add_subgoal` - Task progress tracking

**✅ Completed - Priority 2 tools**:

- `find_files` - Natural language file search (simple implementation, can be enhanced with file-explorer agent)
- `web_search` - Web search via Linkup API (requires API key configuration)
- `read_docs` - Library documentation via Context7 API (requires API key configuration)

### Recommendations

**Optional enhancements**:

- Integrate `codebuff/file-explorer@0.0.7` agent into `find_files` for better search quality
- Add alternative web search providers (DuckDuckGo, Google Custom Search API)
- Cache documentation responses to reduce API calls

**Not needed (SDK-internal or OpenClaw-specific)**:

- `set_messages`, `set_output`, `end_turn` - Codebuff SDK internal
- `ask_user`, `message`, `browser`, `canvas` - OpenClaw Gateway tools

---

## Provider-Specific Tool Support

### AI SDK Providers (via Symphony Bridge)

All AI SDK providers support the same 6 tools listed in Section 1:

- OpenAI (Codex)
- Groq
- Google Gemini
- Mistral
- OpenRouter (27 models)
- SambaNova
- Cerebras
- Ollama (local)
- GitHub Models

### Codebuff SDK Provider

Codebuff has its own internal tool system managed by the SDK. External clients should NOT call Codebuff's internal tools directly.

### Tool Capability Probing

Symphony bridge performs **dynamic tool-capability probing** at startup to verify which providers support structured tool calling:

- **Probe method**: Sends test request with `add(2, 2)` tool
- **Success criteria**: Provider returns structured `toolCalls` (not raw JSON)
- **Classification**:
  - `toolCapableProviders` - Supports structured tools
  - `nonToolCapableProviders` - Excluded from tool-bearing requests
  - Safety-net providers (Ollama) - Always allowed despite tool limitations

---

## References

- Symphony Bridge: `harness/ops/integrations/model/symphony-openai-bridge.mjs`
- Codebuff Bridge: `harness/ops/integrations/model/codebuff-openai-bridge.mjs`
- Symphony Agent: `harness/ops/runtime/symphony/symphony-agent.mjs`
- Tool Types: `.agents/types/tools.types.ts`
- OpenClaw Config: `.openclaw/models.json`, `.openclaw/openclaw.json`
- MCP Contracts: `packages/contracts/mcp/src/`
- Issue Tracker: `harness/ops/integrations/linear/create-missing-tools-issue.mjs`

---

## Next Steps

1. **Implement missing Priority 1 tools** in Symphony bridge (`run_file_change_hooks`, `think_deeply`)
2. **Document tool proxy pattern** for OpenClaw Gateway integration
3. **Verify tool compatibility** across all 38 providers in provider cascade
4. **Update OpenClaw configuration** to reflect actually-available tools
5. **Create Linear issue** for missing tool implementations
