# Symphony Agent Workflow

You are a coding agent working on the ANQR project — a QR code generator web application built with TypeScript, React 19, Vite, and Tailwind CSS.

## Project Structure

- `src/` — application source code
  - `src/components/` — React UI components
  - `src/hooks/` — React hooks and QR generation logic
  - `src/state/` and `src/store/` — Zustand state management
  - `src/lib/` — utility functions and helpers
  - `src/i18n/` — internationalization
  - `src/data/` — static data and gallery items
- `scripts/ops/` — operations and automation scripts (Node.js ESM)
- `tests/unit/` — Vitest unit tests
- `docs/` — project documentation
- `services/systemd/` — systemd unit files

## Rules

1. **Minimal changes only.** Change the fewest files and lines possible to accomplish the task. Every existing line of code has a purpose.
2. **Follow existing patterns.** Mimic the style, naming conventions, and architecture of surrounding code. If nearby files use a specific import pattern, follow it.
3. **No new dependencies.** Do not add npm packages. Work with what's already installed.
4. **TypeScript strict mode.** All code must typecheck. Do not use `any` type casts.
5. **Lint-clean code.** All code must pass oxlint with zero errors and zero warnings.
6. **Spell-check-clean code.** All code must pass cspell with zero issues. If a domain-specific word is flagged (e.g. a protocol name, abbreviation, or technical term), add it to the `"words"` array in `cspell.json` rather than renaming it.
7. **AST density.** Each source file must have at most 1 top-level declaration (function, class, type, or const). If you create a file with multiple declarations, split it into separate files.
8. **Preserve existing behavior.** Do not change code unrelated to the task. Do not refactor opportunistically.
9. **Update imports.** If you move or rename exports, update all references.
10. **No new comments.** Do not add code comments unless the task specifically requires them. Preserve existing comments.
11. **Test compatibility.** Changes must not break existing unit tests.

## Workflow

1. **Understand the issue.** Read the issue title, description, and acceptance criteria carefully.
2. **Read relevant files.** Use `read_file` and `list_directory` to understand the current code before making changes.
3. **Plan changes.** Identify the minimum set of files and changes needed.
4. **Implement.** Use `write_file` for new files, `patch_file` for targeted edits, or `delete_file` to remove files.
5. **Verify.** Read the modified files back to confirm correctness.
6. **Run `run_typecheck`.** Fix any type errors before proceeding.
7. **Run `run_lint`.** Fix any lint errors or warnings. Repeat until clean.
8. **Run `run_cspell`.** Fix any spelling issues. If a domain-specific word is flagged, add it to the `"words"` array in `cspell.json`. Repeat until clean.
9. **Run `run_ast_density`.** Fix any density violations by splitting files so each has at most 1 top-level declaration. Repeat until clean.
10. **Complete.** Call `task_complete` with a brief summary of what you changed.

> **IMPORTANT:** You MUST run `run_typecheck`, `run_lint`, `run_cspell`, and `run_ast_density` and fix all issues before calling `task_complete`. Skipping these checks will cause the commit to be rejected and your changes reverted.

## Tool Tips

- Use `patch_file` for small, targeted edits (preferred over `write_file` for existing files).
- Use `delete_file` to remove files or empty directories. **Never** use `write_file` with empty content to delete files — this creates empty files that fail lint.
- Use `run_command` with `rg` to search the codebase: `rg "pattern" src/ --type ts`
- Use `list_directory` before `read_file` if you're not sure what files exist.
- If a file is too large, use `run_command` with `head` or `tail` to read portions.
- Use `run_typecheck` to check for TypeScript errors (runs `tsc --noEmit`).
- Use `run_lint` to check for lint errors and warnings (runs `oxlint`).
- Use `run_cspell` to check for spelling issues (runs `cspell` on source files).
- Use `run_ast_density` to check AST density (each source file should have ≤1 top-level declaration).

## Validation

After you call `task_complete`, the runner will automatically validate your changes:

- TypeScript typecheck (`tsc --noEmit`)
- Lint (`oxlint` — zero errors and zero warnings required)
- Spell check (`cspell` — zero issues required)
- AST density audit (`--threshold 1` — each file ≤1 top-level declaration)
- Unit tests (`vitest run`)

The git commit hooks also enforce these checks. If any validation fails, your changes will be reverted. Always run `run_typecheck`, `run_lint`, `run_cspell`, and `run_ast_density` yourself before calling `task_complete` to catch issues early.
