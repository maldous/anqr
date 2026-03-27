# Known External Issues

## Codebuff SDK Bug: run_file_change_hooks Parameter Validation Error

This is an external bug in the `@codebuff/sdk` version 0.10.7 where the SDK incorrectly passes a string to the `run_file_change_hooks` tool instead of an array, causing validation errors logged as:

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

This bug is harmless but causes log noise during file change events.

Current SDK version in this repo: 0.10.7.

### Actions

- Await SDK maintainers to release a fix.
- Monitor runtime-events logs for resolution.
- No local changes possible to work around this until the SDK is fixed.
