# Task Completion Checklist

After completing any coding task:

1. **Typecheck**: `npm run typecheck` (or scoped variant for the surface changed)
2. **Lint**: `npm run lint` — fix any oxlint warnings/errors
3. **Format**: `npm run format:check` — run `npm run format` if needed
4. **Spell check**: `npm run cspell` if new prose was added
5. **Unit tests**: `npm run test:unit` for logic changes
6. **Dependency boundaries**: `npm run depcruise` if package imports changed
7. **Commit**: `h5i commit -m "type(scope): message"` (not `git commit`)

For changes to public package contracts:
- Add or update tests for the changed contract
- Verify `npm run contracts:check` passes

Full quality gate before PRs:
```bash
npm run quality   # typecheck + lint + depcruise + test:unit
```
