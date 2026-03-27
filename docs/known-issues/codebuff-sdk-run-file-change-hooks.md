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

- None; configuration does not affect this.
- SDK internal bug.

## Next Steps

- Reported to Codebuff SDK maintainers.
- Monitor for SDK releases with fix.
