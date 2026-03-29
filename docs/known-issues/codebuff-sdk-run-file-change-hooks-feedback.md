# Codebuff SDK Bug Report: `run_file_change_hooks` Parameter Type Mismatch

## Summary

The Codebuff SDK incorrectly passes the `files` parameter as a single string instead of an array when AI models invoke the `run_file_change_hooks` tool. This causes validation errors when the parameter is validated against the expected Zod schema.

## Environment

- **Codebuff SDK Version**: Latest (as of March 2025)
- **Affected Tool**: `run_file_change_hooks`
- **Impact**: Tool calls fail validation when used through OpenAI-compatible bridges or other integrations

## Expected Behavior

According to the tool schema defined in `common/src/tools/params/tool/run-file-change-hooks.ts`, the `files` parameter should be an array of strings:

**File**: `common/src/tools/params/tool/run-file-change-hooks.ts` (lines 10-15)
```typescript
const inputSchema = z.object({
  files: z
    .array(z.string())
    .describe(
      `List of file paths that were changed and should trigger file change hooks`,
    ),
})
```

The tool documentation also shows the expected format in the example (lines 24-33):

```typescript
Example:
${$getNativeToolCallExampleString({
  toolName,
  inputSchema,
  input: {
    files: ['src/components/Button.tsx', 'src/utils/helpers.ts'],
  },
  endsAgentStep,
})}
```

## Actual Behavior

When AI models call the `run_file_change_hooks` tool, the SDK passes the `files` parameter as a single string instead of an array. This occurs in one of the following scenarios:

1. **Single file case**: Instead of `["file.ts"]`, the SDK passes `"file.ts"`
2. **Multiple files case**: Instead of `["file1.ts", "file2.ts"]`, the SDK may pass a JSON-encoded string like `'["file1.ts", "file2.ts"]'`

## Root Cause Analysis

The issue appears to originate from how tool call parameters are serialized when:

1. Converting tool definitions to the format sent to LLMs
2. Processing the LLM's tool call response
3. Marshaling parameters before passing them to tool handlers

The SDK does not currently call the actual `runFileChangeHooks` function (see `sdk/src/run.ts`, line 690-700), instead returning a no-op message. However, when the tool is used through the agent-runtime (e.g., via OpenAI-compatible bridges), the parameter type mismatch causes validation failures.

**File**: `sdk/src/run.ts` (lines 690-700)
```typescript
} else if (toolName === 'run_file_change_hooks') {
  // No-op: SDK doesn't run file change hooks
  result = [
    {
      type: 'json',
      value: {
        message: 'File change hooks are not supported in SDK mode',
      },
    },
  ]
}
```

## Reproduction Steps

1. Set up an OpenAI-compatible bridge that uses the Codebuff SDK
2. Configure an AI model to call the `run_file_change_hooks` tool
3. Have the model attempt to call the tool with a single file: `{"files": ["test.ts"]}`
4. Observe validation error when the parameter is received as `"test.ts"` instead of `["test.ts"]`

## Proof of Bug

### Schema Definition
**File**: `common/src/tools/params/tool/run-file-change-hooks.ts`
- **Lines 10-15**: Defines `files` as `z.array(z.string())`

### Tool Function Signature
**File**: `sdk/src/tools/run-file-change-hooks.ts` (lines 3-7)
```typescript
export function runFileChangeHooks({
  files,
}: {
  files: string[]
}): Promise<CodebuffToolOutput<'run_file_change_hooks'>> {
```

The function expects `files: string[]` but receives a string.

### Handler Implementation
**File**: `packages/agent-runtime/src/tools/handlers/tool/run-file-change-hooks.ts` (lines 8-19)
```typescript
export const handleRunFileChangeHooks = (async (params: {
  previousToolCallFinished: Promise<void>
  toolCall: CodebuffToolCall<ToolName>
  requestClientToolCall: (
    toolCall: ClientToolCall<ToolName>,
  ) => Promise<CodebuffToolOutput<ToolName>>
}): Promise<{ output: CodebuffToolOutput<ToolName> }> => {
  const { previousToolCallFinished, toolCall, requestClientToolCall } = params

  await previousToolCallFinished
  return { output: await requestClientToolCall(toolCall) }
}) satisfies CodebuffToolHandlerFunction<'run_file_change_hooks'>
```

The handler passes through the tool call, which contains the malformed parameter.

## Impact

- **Validation Errors**: Zod schema validation fails with array vs string type mismatch
- **Integration Failures**: OpenAI-compatible bridges and other integrations cannot use this tool reliably
- **Workarounds Required**: Downstream systems must implement preprocessing logic to normalize the parameter

## Suggested Fix

The SDK should ensure that array parameters (like `files`) are preserved as arrays throughout the tool call lifecycle. Specific areas to investigate:

1. **SDK tool call serialization** (`sdk/src/impl/llm.ts`): Ensure tool parameters maintain their types when converted to/from JSON
2. **Agent runtime parameter marshaling** (`packages/agent-runtime/`): Validate that array parameters aren't being converted to strings during transmission
3. **Tool definition conversion**: Ensure Zod schemas are properly converted to LLM tool definitions with correct parameter types

### Potential Fix Location

**File**: `sdk/src/impl/llm.ts` (around line 456)
```typescript
// Current code (problematic for some tool calls):
input: JSON.stringify(spawnAgentsInput),

// Should preserve parameter types correctly for all tools
```

The SDK should ensure that when tool parameters are serialized/deserialized, array types are preserved.

## Workaround

Downstream integrations can implement preprocessing to normalize the `files` parameter:

```typescript
z.preprocess(
  (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return [];
      // Handle JSON-encoded arrays
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [trimmed];
        } catch {
          return [trimmed];
        }
      }
      // Single string - wrap in array
      return [trimmed];
    }
    return [];
  },
  z.array(z.string()).min(1, "At least one file path is required")
)
```

## Additional Notes

This issue may affect other tools with array parameters. A comprehensive audit of all tool parameter handling in the SDK would be beneficial.

## References

- Tool definition: `common/src/tools/params/tool/run-file-change-hooks.ts`
- SDK implementation: `sdk/src/run.ts` (line 690)
- Tool handler: `packages/agent-runtime/src/tools/handlers/tool/run-file-change-hooks.ts`
- Tool function: `sdk/src/tools/run-file-change-hooks.ts`
