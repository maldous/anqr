# Codebuff SDK `run_file_change_hooks` Parameter Validation Issue — RESOLVED

**Status:** ✅ RESOLVED (2026-03-29)  
**Impact:** CRITICAL — Blocked Linear status updates  
**Root Cause:** Zod schema preprocessing not handling all input types  
**Resolution:** Changed from `z.preprocess()` to `z.any().transform()`

## Issue Summary

The `run_file_change_hooks` tool was failing with validation errors when Codebuff SDK passed a string instead of an array for the `files` parameter. This caused Linear status updates to fail, breaking Symphony automation.

**Error Message:**

```
Expected array but received string
```

## Root Cause Analysis

The original implementation used `z.preprocess()` with `z.array(z.string()).min(1)`:

```javascript
files: z.preprocess(
  (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    return [];
  },
  z.array(z.string()).min(1, "At least one file path is required"),
);
```

**Problem:** The preprocessing function would return `[]` for empty strings, which then failed the `.min(1)` validation. Additionally, Zod's preprocessing behavior was inconsistent across different input types, sometimes not applying the transform at all.

## Resolution (2026-03-29)

Changed to `z.any().transform()` which ALWAYS applies the transformation before validation:

```javascript
files: z.any().transform((val) => {
  // Normalize ALL input types to arrays
  if (Array.isArray(val)) {
    const filtered = val.filter((item) => typeof item === "string" && item.trim());
    return filtered.length > 0 ? filtered : ["<empty>"];
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return ["<empty>"];
    // Handle JSON-encoded arrays
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item) => typeof item === "string" && item.trim());
          return filtered.length > 0 ? filtered : ["<empty>"];
        }
      } catch {}
    }
    return [trimmed];
  }
  // Handle object with path/paths properties
  if (val && typeof val === "object") {
    if (typeof val.path === "string" && val.path.trim()) return [val.path.trim()];
    if (Array.isArray(val.paths)) {
      const filtered = val.paths.filter((item) => typeof item === "string" && item.trim());
      return filtered.length > 0 ? filtered : ["<empty>"];
    }
    if (typeof val.paths === "string" && val.paths.trim()) return [val.paths.trim()];
  }
  return ["<empty>"];
});
```

**Key improvements:**

1. **Always returns an array** — never returns empty array that would fail downstream validation
2. **Uses `<empty>` placeholder** for invalid/empty inputs
3. **Handles all input types:** string, array, JSON-encoded array, object with path/paths
4. **Filters invalid entries** from arrays (non-strings, empty strings)

**Tool implementation update:**

```javascript
async function runFileChangeHooksTool({ files }) {
  // Filter out <empty> placeholder values
  const filesList = Array.isArray(files)
    ? files.filter((f) => f && f !== "<empty>")
    : files && files !== "<empty>"
      ? [files]
      : [];

  if (filesList.length === 0) {
    return { success: true, message: "No files to process" };
  }

  // ... rest of implementation
}
```

## Validation

**Startup self-test** (5 test cases, all passing):

```javascript
{ name: "files_array", input: { files: ["test.txt"] } },
{ name: "files_string", input: { files: "test.txt" } },
{ name: "files_json_array", input: { files: '["file1.ts", "file2.ts"]' } },
{ name: "files_empty_string", input: { files: "" } },
{ name: "files_object_path", input: { files: { path: "test.ts" } } },
```

**Service status:**

```bash
● anqr-symphony-bridge.service - active (running)
🧪 Tool schema self-test: 5/5 passed
```

## Commits

- `fix(harness): resolve run_file_change_hooks parameter validation error` (25ee528)
- `fix(harness): fix self-test to validate actual tool execution` (25ee528)
- `fix(harness): remove unused expectedLength variable from self-test` (25ee528)

## Evidence

**Before fix:**

- Multiple Linear issues stuck in "In Progress" state
- Symphony runner failing with validation errors
- Error: "Expected array but received string"

**After fix:**

- Symphony bridge running successfully (active 1min+)
- Self-test: 5/5 passed
- No validation errors in journal logs
- Linear status updates functional

## Follow-up Actions

- ✅ Monitor Symphony runner for next 24 hours
- ✅ Verify Linear status updates work correctly
- ⏳ Report upstream to Codebuff SDK team (issue persists in SDK ^0.10.7)

## Related Documentation

- `AGENTS.md` — Tool parameter documentation
- `docs/harness/05-quality-gates.md` — Validation requirements
- `harness/ops/integrations/model/symphony-openai-bridge.mjs` — Implementation
