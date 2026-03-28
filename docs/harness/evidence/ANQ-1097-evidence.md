# ANQ-1097 Evidence

## Summary

ANQ-1097 is a stale Sonar issue referring to a file that no longer exists in the repository.

## Scope class

Harness maintenance — Sonar issue validation

## Issue details

- **Rule:** `javascript:S7781`
- **Severity:** MINOR
- **Type:** CODE_SMELL
- **File:** `scripts/ops/integrations/linear/reopen-stuck-issues.mjs`
- **Line:** 77
- **Message:** This pattern can be replaced with '\\n'.

## Finding

The file `scripts/ops/integrations/linear/reopen-stuck-issues.mjs` does not exist in the repository. It was deleted in commit `7238d4904` with the message "fix(harness): remove stuck detection and implement missing tools for ANQ-1056".

## Decision

No code changes required. This is a stale Sonar issue that has already been resolved by the file's deletion.

## Commands run

```bash
# Verify file does not exist
find scripts/ops/integrations/linear -name "*.mjs"

# Check git history
git log --all --full-history --oneline -- scripts/ops/integrations/linear/reopen-stuck-issues.mjs
```

## Result

✅ File confirmed deleted in commit `7238d4904`  
✅ No code changes needed

## Changed files

None

## Commit hash

N/A — No changes made

## Risk / rollback note

No risk. The problematic code no longer exists.

## Follow-up work

Mark Sonar issue ANQ-1097 as obsolete or closed in SonarQube since the file no longer exists.
