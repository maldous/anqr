# Codebuff SDK Bug: run_file_change_hooks Parameter Validation Error

## Summary

There is a known bug in the `@codebuff/sdk` package (version ^0.10.7 and possibly earlier) where the SDK internally calls the `run_file_change_hooks` tool with an incorrect parameter type.

The SDK incorrectly passes the `files` parameter as a string instead of an array of strings, which violates the tool parameter validation rules.

## Error Message

```
❌ Error: Invalid parameters for run_file_change_hooks: [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": [
      "files"
    ],
    "message": "Invalid input: expected array, received string"
  }
]
```

## Root Cause

- The tool interface expects `files` to be a string array (`string[]`).
- The SDK passes a single string instead of an array.

## Impact

- Causes noise in logs with parameter validation errors.
- No functional impact on core features.
- Occurs during file change events triggered by the SDK.

## Reproduction

1. Use `@codebuff/sdk` version ^0.10.7.
2. Trigger file change events (modifying files).
3. Observe runtime logs for the above error.

## Workarounds

**Symphony Bridge**: The Symphony bridge (port 4319) includes robust preprocessing logic that automatically normalizes the `files` parameter to an array, handling all of these cases:

- ✅ Single string → wraps in array: `"file.ts"` → `["file.ts"]`
- ✅ JSON-encoded array string → parses: `'["file1.ts", "file2.ts"]'` → `["file1.ts", "file2.ts"]`
- ✅ Array → passes through: `["file.ts"]` → `["file.ts"]`
- ✅ Object with path/paths properties → extracts to array

This preprocessing is defined in `scripts/ops/integrations/model/symphony-openai-bridge.mjs` (line ~1671) using Zod's `z.preprocess()` function.

**Result**: The SDK bug causes no functional issues when using the Symphony bridge. Validation errors are eliminated by the normalization layer.

## Next Steps

- ✅ **Mitigated**: Symphony bridge preprocessing handles all cases
- Monitor for SDK releases with fix
- Consider reporting to Codebuff SDK maintainers if not already done
