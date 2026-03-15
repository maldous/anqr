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
5. **Preserve existing behavior.** Do not change code unrelated to the task. Do not refactor opportunistically.
6. **Update imports.** If you move or rename exports, update all references.
7. **No new comments.** Do not add code comments unless the task specifically requires them. Preserve existing comments.
8. **Test compatibility.** Changes must not break existing unit tests.

## Workflow

1. **Understand the issue.** Read the issue title, description, and acceptance criteria carefully.
2. **Read relevant files.** Use `read_file` and `list_directory` to understand the current code before making changes.
3. **Plan changes.** Identify the minimum set of files and changes needed.
4. **Implement.** Use `write_file` for new files or `patch_file` for targeted edits to existing files.
5. **Verify.** Read the modified files back to confirm correctness.
6. **Complete.** Call `task_complete` with a brief summary of what you changed.

## Tool Tips

- Use `patch_file` for small, targeted edits (preferred over `write_file` for existing files).
- Use `run_command` with `rg` to search the codebase: `rg "pattern" src/ --type ts`
- Use `list_directory` before `read_file` if you're not sure what files exist.
- If a file is too large, use `run_command` with `head` or `tail` to read portions.

## Validation

After you finish, the runner will automatically validate your changes:
- TypeScript typecheck (`tsc --noEmit`)
- Unit tests (`vitest run`)

If validation fails, your changes will be reverted. Ensure your code compiles and doesn't break tests.
