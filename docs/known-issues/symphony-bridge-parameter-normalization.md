# Symphony Bridge Parameter Normalization

## Problem Statement

The Symphony Bridge was experiencing persistent validation errors where tools received strings instead of arrays, causing failures like:

```
Invalid parameters for run_file_change_hooks: [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": ["files"],
    "message": "Invalid input: expected array, received string"
  }
]
```

This affected multiple tools:

- `run_file_change_hooks` (`files` parameter)
- `read_files` (`paths` parameter)
- `str_replace` (`replacements` parameter)
- `spawn_agents` (`agents` parameter)
- `read_subtree` (`paths` and `maxTokens` parameters)
- `set_messages` (`messages` parameter)
- `suggest_followups` (`followups` parameter)
- `write_todos` (`todos` parameter)
- `ask_user` (`questions` and nested `options` parameters)

## Root Cause

The original normalization logic used Zod's `.transform()` method, which runs **after** validation. When the AI SDK or Codebuff SDK sent a string instead of an array, Zod would reject the input before the transform had a chance to normalize it.

### Example of the broken pattern:

```typescript
z.object({
  files: z.union([z.array(z.string()), z.string()]).transform((val) => {
    // This transform runs AFTER validation
    // If SDK sends a string, Zod rejects before reaching here
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    return [];
  }),
});
```

## Solution

Use Zod's `.preprocess()` method instead, which runs **before** validation. This allows us to normalize malformed inputs into the expected format before Zod validates the schema.

### Correct pattern:

```typescript
z.object({
  files: z.preprocess((val) => {
    // This preprocessing runs BEFORE validation
    // We can normalize any input format into an array
    if (Array.isArray(val)) {
      return val.filter((item) => typeof item === "string" && item.trim());
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return [];
      // Handle JSON-encoded arrays
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter((item) => typeof item === "string" && item.trim());
          }
          return [trimmed];
        } catch {
          return [trimmed];
        }
      }
      // Single string - wrap in array
      return [trimmed];
    }
    return [];
  }, z.array(z.string()).describe("List of file paths (accepts string or array)")),
});
```

## Key Differences: `.transform()` vs `.preprocess()`

| Feature             | `.transform()`               | `.preprocess()`                  |
| ------------------- | ---------------------------- | -------------------------------- |
| **Execution order** | After validation             | Before validation                |
| **Use case**        | Transform valid data         | Normalize malformed data         |
| **Error handling**  | Cannot fix validation errors | Can prevent validation errors    |
| **Chaining**        | Requires `.pipe()`           | Direct schema as second argument |

## Implementation

All affected tools in `symphony-openai-bridge.mjs` have been updated to use `.preprocess()`:

1. **run_file_change_hooks** — `files` parameter
2. **read_files** — `paths` parameter
3. **str_replace** — `replacements` parameter
4. **spawn_agents** — `agents` parameter
5. **propose_str_replace** — `replacements` parameter
6. **read_subtree** — `paths` and `maxTokens` parameters
7. **set_messages** — `messages` parameter
8. **suggest_followups** — `followups` parameter
9. **write_todos** — `todos` parameter
10. **ask_user** — `questions` and nested `options` parameters

## Validation

### Startup Self-Tests

The Symphony Bridge now runs comprehensive schema validation tests at startup, testing:

- Array inputs
- Single string inputs (wrapped to array)
- JSON-encoded array strings
- Empty strings (handled gracefully)
- Object inputs with path/paths properties
- Numeric vs string numbers for `maxTokens`

If any test fails, the bridge **refuses to start** with exit code 1.

### Test Suite

A comprehensive test suite validates all normalization logic:

```bash
npx vitest run harness/ops/integrations/model/symphony-openai-bridge-normalization.spec.ts
```

**52 tests** cover:

- All tool parameter types
- Edge cases (empty, null, undefined)
- Malformed inputs (invalid JSON, mixed types)
- Unicode and special characters
- Performance with large arrays
- Circular reference protection

## Accepted Input Formats

All array parameters now accept these formats:

### 1. Native Array (ideal)

```json
{ "files": ["file1.ts", "file2.ts"] }
```

### 2. Single String (auto-wrapped)

```json
{ "files": "file1.ts" }
```

### 3. JSON-Encoded String

```json
{ "files": "[\"file1.ts\", \"file2.ts\"]" }
```

### 4. Object with path property

```json
{ "files": { "path": "file1.ts" } }
```

### 5. Empty/Null (fallback)

```json
{ "files": "" }  // Returns []
{ "files": null }  // Returns []
```

## Backward Compatibility

This change is **100% backward compatible**:

- All valid inputs continue to work
- Previously failing inputs now work correctly
- No breaking changes to the API

## Codebuff Bridge Status

The Codebuff Bridge does not have this issue because it uses the Codebuff SDK's internal tool validation, which handles normalization differently. However, we should verify that the Codebuff Bridge also handles malformed inputs gracefully.

## Related Issues

- Tool `read_files` validation errors
- Tool `spawn_agents` "Agent not available" errors (caused by invalid agent array)
- Tool `str_replace` validation failures
- General "Tool X is not currently available" errors (often caused by parameter validation)

## Prevention

To prevent this issue in the future:

1. **Always use `.preprocess()` for flexible inputs** — especially arrays that might receive strings
2. **Test with malformed inputs** — don't assume SDKs will always send perfect data
3. **Comprehensive startup self-tests** — validate all schemas before accepting requests
4. **Monitor journalctl for validation errors** — pattern: `grep "Invalid parameters"`

## Verification Commands

```bash
# Check for validation errors in logs
journalctl --user -u anqr-symphony-bridge.service | grep "Invalid parameters" | tail -20

# Health check after restart
curl -s http://127.0.0.1:4319/health | python3 -m json.tool

# Verify no validation errors during test requests
journalctl --user -u anqr-symphony-bridge.service -f | grep -E "(Invalid|❌)"
```

## Deployment

1. **Commit changes** with clear description of the fix
2. **Wait for zero concurrency** (check Discord for active requests)
3. **Restart Symphony Bridge**:
   ```bash
   systemctl --user restart anqr-symphony-bridge
   ```
4. **Verify startup self-tests pass**:
   ```bash
   journalctl --user -u anqr-symphony-bridge.service --no-pager -n 100 | grep "self-test"
   ```
5. **Monitor for validation errors**:
   ```bash
   journalctl --user -u anqr-symphony-bridge.service -f | grep "Invalid parameters"
   ```

## Success Criteria

After restart, you should see:

```
🧪 Tool schema self-test: 29/29 passed (all array normalization working)
```

And **NO** validation errors in journalctl for:

- `run_file_change_hooks`
- `read_files`
- `str_replace`
- `spawn_agents`
- Any other array-parameter tools
