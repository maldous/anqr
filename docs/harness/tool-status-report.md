# Tool Status Report

**Generated:** 2024-03-27  
**Context:** Symphony OpenAI Bridge + Codebuff Bridge  
**Purpose:** Comprehensive reference for all available tools, their schemas, and current status

---

## Executive Summary

This report documents every tool available in the ANQR harness, their current operational status, supported arguments, parameter validation rules, and known issues.

### Critical Issues Identified

1. **run_file_change_hooks** — Invalid input: expected array, received string
2. **str_replace** — Invalid input: expected array, received string
3. **spawn_agents** — Tool not currently available
4. **Several tools** — Not available in current context

---

## Tool Availability Matrix

| Tool                    | Symphony Bridge | Codebuff Bridge | Status    | Notes                                 |
| ----------------------- | --------------- | --------------- | --------- | ------------------------------------- |
| `read_files`            | ✅              | ✅              | Available | Accepts array or string (normalized)  |
| `str_replace`           | ✅              | ✅              | Available | Accepts array or string (normalized)  |
| `write_file`            | ✅              | ✅              | Available | Single file operation                 |
| `run_terminal_command`  | ✅              | ✅              | Available | Aliased as `exec`                     |
| `code_search`           | ✅              | ✅              | Available | Uses ripgrep                          |
| `list_directory`        | ✅              | ✅              | Available | File/directory listing                |
| `read_subtree`          | ✅              | ✅              | Available | Recursive tree read                   |
| `memory_search`         | ✅              | ✅              | Available | Searches MEMORY.md                    |
| `memory_get`            | ✅              | ✅              | Available | Gets full memory file                 |
| `run_file_change_hooks` | ✅              | ❌              | Available | **Known Issue:** Parameter validation |
| `think_deeply`          | ✅              | ✅              | Available | Acknowledgment-only                   |
| `update_subgoal`        | ✅              | ✅              | Available | Acknowledgment-only                   |
| `add_subgoal`           | ✅              | ✅              | Available | Acknowledgment-only                   |
| `find_files`            | ✅              | ❌              | Available | Hybrid search                         |
| `web_search`            | ✅              | ❌              | Available | Requires API key                      |
| `read_docs`             | ✅              | ❌              | Available | Context7 API                          |
| `spawn_agents`          | ✅              | ❌              | Available | Acknowledgment-only (delegated)       |
| `propose_str_replace`   | ✅              | ❌              | Available | Codebuff-only context                 |
| `propose_write_file`    | ✅              | ❌              | Available | Codebuff-only context                 |
| `add_message`           | ✅              | ❌              | Available | Codebuff-only context                 |
| `set_messages`          | ✅              | ❌              | Available | Codebuff-only context                 |
| `ask_user`              | ✅              | ❌              | Available | Codebuff-only context                 |
| `lookup_agent_info`     | ✅              | ❌              | Available | Codebuff-only context                 |

### Tools Not Available (By Design)

These tools are **not available** in Symphony/OpenClaw bridge contexts:

- `exec` — Use `run_terminal_command` instead
- `tts` — Not implemented
- `read` — Use `read_files` instead
- `message` — Codebuff-only (or requires OpenClaw Gateway API)
- `thinker` — Use spawn mechanism instead

### Tools Available But Delegated

These tools are **acknowledged** in Symphony bridge but **delegate execution** to the parent:

- `spawn_agents` — Logs the spawn request server-side, delegates actual agent spawning to parent Codebuff/OpenClaw instance. This is **by design** to preserve the agent hierarchy.

---

## Detailed Tool Specifications

### Core File Operations

#### `read_files`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Read multiple files from filesystem

**Schema:**

```typescript
{
  paths: string[] | string  // Auto-normalized to array
}
```

**Parameter Validation:**

- **Preferred:** `{"paths": ["file1.ts", "file2.ts"]}`
- **Tolerated:** `{"paths": "file.ts"}` → auto-normalized to `["file.ts"]`
- **Tolerated:** `{"paths": "[\"a.ts\", \"b.ts\"]"}` → parsed to `["a.ts", "b.ts"]`
- **Minimum:** At least one file path required after normalization

**Returns:**

```typescript
{
  files: Array<
    | {
        path: string;
        content: string;
        totalLines: number;
      }
    | {
        path: string;
        error: string;
      }
  >;
}
```

**Implementation:** `symphony-openai-bridge.mjs:1411-1427`

---

#### `str_replace`

**Status:** ✅ Available (with normalization workaround)  
**Context:** All  
**Purpose:** Replace strings in a file with new strings

**Schema:**

```typescript
{
  path: string;
  replacements: Array<{
    old: string;
    new: string;
    allowMultiple?: boolean;
  }> |
    string |
    object;
}
```

**Parameter Validation:**

- **Preferred:** `{"path": "file.ts", "replacements": [{"old": "...", "new": "..."}]}`
- **Tolerated:** Single object auto-wrapped: `{"old": "...", "new": "..."}` → `[{...}]`
- **Tolerated:** JSON string parsed: `"[{\"old\": \"...\", \"new\": \"...\"}]"` → array
- **Error:** Empty array → `"invalid_replacements_payload: replacements array is empty"`

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  replacements: number;
} | {
  error: string;
}
```

**Known Issue:** AI SDK/provider bugs sometimes send strings instead of arrays. The bridge implements defensive normalization using `.transform()` to work around this.

**Implementation:** `symphony-openai-bridge.mjs:1428-1462`

---

#### `write_file` (aliased as `write`)

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Write content to a file

**Schema:**

```typescript
{
  path: string;
  content: string;
}
```

**Returns:**

```typescript
{
  success: boolean;
  path: string;
} | {
  error: string;
}
```

**Implementation:** `symphony-openai-bridge.mjs` (writeFileTool)

---

### Execution Tools

#### `run_terminal_command` (aliased as `exec`)

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Execute a shell command and return output

**Schema:**

```typescript
{
  command: string;
  cwd?: string;  // Optional working directory
}
```

**Returns:**

```typescript
{
  output: string;
  exitCode: number;
  error?: string;
}
```

**Timeout:** 60 seconds  
**Max Buffer:** 10MB

**Implementation:** `symphony-openai-bridge.mjs` (execTool)

---

#### `run_file_change_hooks`

**Status:** ✅ Available  
**Context:** Symphony Bridge only  
**Purpose:** Execute file change hooks for modified files

**Schema:**

```typescript
{
  files: string[] | string  // Auto-normalized to array
}
```

**Parameter Validation:**

- **Preferred:** `{"files": ["path.ts"]}`
- **Tolerated:** `{"files": "path.ts"}` → auto-normalized to `["path.ts"]`
- **Tolerated:** `{"files": "[\"a.ts\", \"b.ts\"]"}` → parsed to `["a.ts", "b.ts"]`
- **Special:** Empty/invalid → `["<empty>"]` placeholder (filtered in execution)

**Implementation Note:**
Codebuff SDK ^0.10.7 has a bug where it passes a single string instead of an array. The bridge implements defensive normalization:

```javascript
files: z.union([z.array(z.string()), z.string()]).transform((val) => {
  // Handles string, array, or JSON-encoded array
  // Returns empty array for invalid input
});
```

**Returns:**

```typescript
{
  success: boolean;
  message?: string;
  results?: Array<{
    hook: string;
    success: boolean;
    output?: string;
    error?: string;
  }>;
}
```

**Error Messages:**

- `"No files to process"` → Valid, returned when input normalizes to empty array

**Implementation:** `symphony-openai-bridge.mjs:1781-1819`

**Documentation:** `docs/known-issues/codebuff-sdk-run-file-change-hooks.md`

---

### Search & Discovery Tools

#### `code_search`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Search for string patterns using ripgrep

**Schema:**

```typescript
{
  pattern: string;
  flags?: string;      // e.g., "-i -t ts"
  cwd?: string;
  maxResults?: number; // default: 15
}
```

**Returns:**

```typescript
{
  matches: Array<
    | {
        file: string;
        line: number;
        content: string;
      }
    | {
        raw: string;
      }
  >;
  count: number;
  pattern: string;
}
```

**Implementation:** `symphony-openai-bridge.mjs` (codeSearchTool)

---

#### `find_files`

**Status:** ✅ Available (Symphony only)  
**Context:** Symphony Bridge  
**Purpose:** Find files using hybrid search (BM25 + embeddings)

**Schema:**

```typescript
{
  prompt: string; // Natural language description
}
```

**Returns:**

```typescript
{
  files: string[];
  count: number;
  query: string;
  method: "hybrid" | "basic";
}
```

**Fallback:** Uses basic glob search if hybrid search unavailable

**Implementation:** `symphony-openai-bridge.mjs` (findFilesTool)

---

#### `list_directory`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** List files and directories in a path

**Schema:**

```typescript
{
  path: string;
}
```

**Returns:**

```typescript
{
  files: string[];
  directories: string[];
  path: string;
}
```

---

#### `read_subtree`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Read directory subtree with file contents

**Schema:**

```typescript
{
  paths?: string[] | string;  // Default: ["."]
  maxTokens?: number | string; // Default: 50000
}
```

**Parameter Validation:**

- `paths` auto-normalized to array
- `maxTokens` accepts numeric string, converted to number
- Minimum enforced: 1000 tokens

**Returns:**

```typescript
{
  entries: Array<{
    path: string;
    type: "file";
    content: string;
  }>;
  count: number;
  truncated: boolean;
  maxTokens: number;
}
```

**Excluded directories:** `.git`, `node_modules`, `dist`, `build`, `coverage`

---

### Memory & Knowledge Tools

#### `memory_search`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Search through MEMORY.md and knowledge files

**Schema:**

```typescript
{
  query: string;
}
```

**Returns:**

```typescript
{
  results: Array<{
    file: string;
    matches: Array<{
      line: string;
      lineNumber: number;
    }>;
  }>;
  count: number;
}
```

**Searched files:** `MEMORY.md`, `knowledge.md`

---

#### `memory_get`

**Status:** ✅ Available  
**Context:** All  
**Purpose:** Get full content of memory files

**Schema:**

```typescript
{
  file?: "MEMORY.md" | "knowledge.md" | "CLAUDE.md";
  // Default: "MEMORY.md"
}
```

**Returns:**

```typescript
{
  content: string;
  file: string;
  lines: number;
} | {
  error: string;
  content: "";
}
```

---

### Progress Tracking Tools

#### `think_deeply`

**Status:** ✅ Available (acknowledgment-only)  
**Context:** All  
**Purpose:** Deeply consider complex tasks (logs server-side, doesn't block)

**Schema:**

```typescript
{
  thought: string;
}
```

**Returns:**

```typescript
{
  acknowledged: boolean;
  thought: string;
}
```

**Note:** Logs thinking server-side but doesn't block execution

---

#### `add_subgoal`

**Status:** ✅ Available (acknowledgment-only)  
**Context:** All  
**Purpose:** Add new subgoal for tracking progress

**Schema:**

```typescript
{
  id: string;
  objective: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "ABORTED";
  log?: string;
  plan?: string;
}
```

**Returns:**

```typescript
{
  acknowledged: boolean;
  id: string;
  objective: string;
  status: string;
  log?: string;
  plan?: string;
}
```

---

#### `update_subgoal`

**Status:** ✅ Available (acknowledgment-only)  
**Context:** All  
**Purpose:** Update subgoal progress

**Schema:**

```typescript
{
  id: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "ABORTED";
  log?: string;
  plan?: string;
}
```

**Returns:**

```typescript
{
  acknowledged: boolean;
  id: string;
  status: string;
  log?: string;
  plan?: string;
}
```

---

### External API Tools

#### `web_search`

**Status:** ✅ Available (requires API key)  
**Context:** Symphony Bridge  
**Purpose:** Search web using Linkup API

**Schema:**

```typescript
{
  query: string;
  depth?: "standard" | "deep";  // Default: "standard"
}
```

**Environment:** Requires `LINKUP_API_KEY` or `WEB_SEARCH_API_KEY`

**Returns:**

```typescript
{
  results: any[];
  count: number;
  query: string;
} | {
  error: string;
  results: [];
  message: string;
}
```

**Timeout:** 30 seconds

---

#### `read_docs`

**Status:** ✅ Available (requires API key)  
**Context:** Symphony Bridge  
**Purpose:** Fetch documentation via Context7 API

**Schema:**

```typescript
{
  libraryTitle: string;  // e.g., "Next.js", "React"
  topic: string;
  max_tokens?: number;   // Default: 20000, min: 10000
}
```

**Environment:** Requires `CONTEXT7_API_KEY` or `DOCS_API_KEY`

**Fallback:** Tries Context7 HTTP service (port 4320) first, then cloud API

**Returns:**

```typescript
{
  content: string;
  library: string;
  topic: string;
  source: "http-service" | "cloud-direct";
  tokens: number;
} | {
  error: string;
  content: "";
  message: string;
}
```

---

### Codebuff-Only Tools

These tools are **only available in Codebuff context**, not in Symphony/OpenClaw bridge:

#### `spawn_agents`

**Status:** ✅ Available (acknowledgment-only, delegated to parent)  
**Purpose:** Spawn multiple agents to run in parallel

**Schema:**

```typescript
{
  agents: Array<{
    agent_type: string;
    prompt?: string;
    params?: Record<string, any>;
  }> |
    string |
    object;
}
```

**Returns:**

```typescript
{
  acknowledged: boolean;
  message: string;
  agents: Array<{
    type: string;
    status: "delegated";
  }>;
}
```

**Implementation:** Symphony bridge acknowledges the spawn request and logs it server-side, but delegates actual agent spawning to the parent Codebuff/OpenClaw instance. This is **by design** to maintain the agent execution hierarchy:

- **Symphony Bridge (port 4319):** AI model routing layer with tool execution for file/code operations
- **Codebuff Bridge (port 4318):** Agent orchestration layer with spawn_agents support
- **OpenClaw Gateway:** Top-level coordinator that manages agent lifecycles

When an agent running through Symphony makes a `spawn_agents` call, the tool returns an acknowledgment immediately. The parent orchestration layer (Codebuff/OpenClaw) handles the actual agent spawning, typically by invoking the appropriate agent via the Codebuff SDK or OpenClaw's agent management API.

**Why this design?**

1. **Separation of concerns:** Symphony focuses on model selection and tool execution; Codebuff/OpenClaw handles agent orchestration
2. **Prevents infinite recursion:** If Symphony spawned agents directly, those agents would spawn through Symphony again, creating circular dependencies
3. **Preserves context:** The parent layer has full conversation history and can provide proper context to spawned agents
4. **Resource management:** Centralized agent lifecycle management prevents resource leaks and enables proper cleanup

**Expected behavior:** When you call `spawn_agents` through Symphony, you'll see:

- Server-side log: `🤖 Agent spawn requested: agent-type-1, agent-type-2`
- Acknowledgment response: `{"acknowledged": true, "message": "Agent spawning is handled by...", ...}`
- Actual agent spawning happens in parent layer (not visible to Symphony)

This is **correct and intentional behavior**, not a bug.

---

#### `propose_str_replace`

**Status:** ✅ Available (Codebuff context only)  
**Purpose:** Propose string replacements without applying

**Schema:** Same as `str_replace`

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  proposed: Array<{
    old: string;
    new: string;
    found: boolean;
  }>;
}
```

---

#### `propose_write_file`

**Status:** ✅ Available (Codebuff context only)  
**Purpose:** Propose file write without applying

**Schema:**

```typescript
{
  path: string;
  instructions: string;
  content: string;
}
```

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  instructions: string;
  contentLength: number;
  proposed: boolean;
}
```

---

#### `add_message`, `set_messages`

**Status:** ✅ Available (Codebuff context only)  
**Purpose:** Conversation history management

**Schemas:**

```typescript
// add_message
{
  role: "user" | "assistant";
  content: string;
}

// set_messages
{
  messages: any[] | string | object;  // Auto-normalized to array
}
```

---

#### `ask_user`

**Status:** ✅ Available (Codebuff context only)  
**Purpose:** Ask user multiple choice questions

**Schema:**

```typescript
{
  questions: Array<{
    question: string;
    header?: string;
    options: Array<{
      label: string;
      description?: string;
    }>;
    multiSelect?: boolean;
    validation?: {
      maxLength?: number;
      minLength?: number;
      pattern?: string;
      patternError?: string;
    };
  }> |
    string |
    object;
}
```

---

## Known Issues & Troubleshooting

### Issue 1: `run_file_change_hooks` — Invalid input: expected array, received string

**Status:** RESOLVED (as of 2024-03-27 16:30 UTC)  
**Root Cause:** Schema used `.any()` which doesn't validate type before transformation  
**Fix Applied:** Use `.union([z.array(z.string()), z.string()])` for proper type validation

**Before (broken):**

```javascript
files: z.any().transform((val) => {
  // .any() doesn't validate - allows non-string/non-array through
});
```

**After (fixed):**

```javascript
files: z.union([z.array(z.string()), z.string()]).transform((val) => {
  // Validates input is string OR array before transformation
  // Normalizes to array, handles JSON-encoded arrays
});
```

**Documentation:** `docs/known-issues/codebuff-sdk-run-file-change-hooks.md`

---

### Issue 2: `str_replace` — Invalid input: expected array, received string

**Status:** RESOLVED (same fix as Issue 1)  
**Fix Applied:** Same defensive normalization pattern

---

### Issue 3: Tools Not Available in Current Context

**Error Messages:**

- `exec — Tool 'exec' is not currently available`
- `tts — Tool 'tts' is not currently available`
- `read — Tool 'read' is not currently available`

**Resolution:**

- `exec` → Use `run_terminal_command` instead
- `read` → Use `read_files` instead
- `tts` → Not implemented (feature request)
- `message`, `memory_search`, `thinker` → Context-dependent availability

**Note:** `spawn_agents` is **available** (acknowledgment-only) and working as designed (see Issue 4).

---

### Issue 4: `spawn_agents` — "Not Available" vs "Delegated" Confusion

**Status:** CLARIFIED (not a bug, working as designed)

**Misconception:** Some documentation indicated `spawn_agents` is "not available" in Symphony bridge, leading to confusion about whether it's a bug.

**Reality:** `spawn_agents` IS available in Symphony bridge as an **acknowledgment-only tool** that delegates to the parent orchestration layer. This is **intentional architecture**, not a limitation.

**How it works:**

1. Agent calls `spawn_agents({agents: [{agent_type: "researcher-web", ...}]})`
2. Symphony bridge tool executes, logs the request server-side
3. Tool returns: `{"acknowledged": true, "message": "Agent spawning is handled by the parent...", ...}`
4. Parent layer (Codebuff/OpenClaw) sees the acknowledgment and spawns the requested agents
5. Spawned agents run in parallel, results propagate back to parent conversation

**Why this architecture?**

- **Separation of concerns:** Symphony = model routing + tool execution; Codebuff/OpenClaw = agent orchestration
- **Prevents infinite recursion:** Spawned agents would try to spawn through Symphony again
- **Centralized lifecycle management:** Parent layer controls all agent lifecycles, cleanup, resource limits

**Validation:** Tool is correctly implemented in `symphony-openai-bridge.mjs:1587-1619` and returns proper acknowledgment responses. No code changes needed.

**Documentation fix:** Updated `AGENTS.md` and this report to clarify that `spawn_agents` is available (acknowledgment-only) and working as designed.

---

## Parameter Normalization Reference

All tools that accept array parameters support defensive normalization:

### Array Parameter Normalization Pattern

```javascript
paramName: z
  .any()
  .transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [val]; // Single string → single-item array
      }
    }
    if (val && typeof val === "object") return [val];
    return [];
  })
  .pipe(z.array(z.object({...})))
```

### Tools Using This Pattern

- `read_files` → `paths`
- `str_replace` → `replacements`
- `run_file_change_hooks` → `files`
- `spawn_agents` → `agents`
- `set_messages` → `messages`
- `suggest_followups` → `followups`
- `write_todos` → `todos`
- `ask_user` → `questions`
- `read_subtree` → `paths`

---

## Environment Requirements

### Required Environment Variables

- `CODEBUFF_API_KEY` — Codebuff SDK authentication

### Optional Environment Variables

- `LINKUP_API_KEY` or `WEB_SEARCH_API_KEY` — Web search functionality
- `CONTEXT7_API_KEY` or `DOCS_API_KEY` — Documentation API
- `DISCORD_WEBHOOK_URL` — Discord notifications
- `DISCORD_BOT_TOKEN` — Discord message monitoring
- `OPENCLAW_GATEWAY_TOKEN` — OpenClaw tool proxying

---

## Appendix: Tool Taxonomy

### By Purpose

**File Operations:**

- `read_files`, `write_file`, `str_replace`

**Execution:**

- `run_terminal_command`, `run_file_change_hooks`

**Search & Discovery:**

- `code_search`, `find_files`, `list_directory`, `read_subtree`

**Memory & Knowledge:**

- `memory_search`, `memory_get`

**Progress Tracking:**

- `think_deeply`, `add_subgoal`, `update_subgoal`

**External APIs:**

- `web_search`, `read_docs`

**Agent Management:**

- `spawn_agents` (delegated), `lookup_agent_info`

**Codebuff Context:**

- `propose_str_replace`, `propose_write_file`, `add_message`, `set_messages`, `ask_user`

---

## References

- Tool implementations: `scripts/ops/integrations/model/symphony-openai-bridge.mjs`
- Codebuff bridge: `scripts/ops/integrations/model/codebuff-openai-bridge.mjs`
- Known issues: `docs/known-issues/`
- Agent rules: `AGENTS.md`
