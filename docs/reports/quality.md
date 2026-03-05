# Quality Gates

Use these checks before handoff when applicable:

- Type safety: `npm run typecheck`
- Unit suite: `npm run test:unit`
- Required test coverage contract: `npm run test:required:strict`
- Test ID coverage: `npm run test:testid && npm run test:testid:refs`
- Bundle budget: `npm run test:bundle:budget`

Legacy entry point: [`../../quality.md`](../../quality.md).

