# Suggested Commands

## Typecheck
```bash
npm run typecheck               # full typecheck (all tsconfigs)
npm run typecheck:src           # src/ only
npm run typecheck:apps          # apps/ only
npm run typecheck:packages      # packages/ only
npm run typecheck:harness       # harness/ only
npm run typecheck:all           # all surfaces in sequence
```

## Lint & Format
```bash
npm run lint                    # oxlint entire repo
npm run lint:fix                # oxlint with auto-fix
npm run format                  # oxfmt write (format all)
npm run format:check            # oxfmt check (no write)
```

## Testing
```bash
npm run test:unit               # vitest unit tests (--maxWorkers=1)
npm run test:unit:coverage      # unit tests with coverage
npm run test                    # playwright (all projects)
npm run test:basic              # playwright basic tier
npm run test:advanced           # playwright advanced tier
npm run test:professional       # playwright professional tier
npm run test:e2e                # vitest e2e config
```

## Quality gate (run before PR)
```bash
npm run quality                 # typecheck + lint + depcruise + test:unit
```

## Build
```bash
npm run build                   # tsc + vite build
npm run build:all               # packages build + web build
```

## Harness / Ops
```bash
npm run harness:quick           # quick harness report
npm run harness:full            # full harness report
npm run harness:doctor          # harness health check
npm run linear:status           # Linear project status
npm run linear:reconciler:once  # run Linear reconciler once
npm run nightly                 # nightly ops pass
```

## Dependency analysis
```bash
npm run depcruise               # architecture + contracts check
npm run knip                    # dead code detection
npm run cspell                  # spell check
```

## Commits
```bash
h5i commit -m "type(scope): message"   # AI-provenance commit (use instead of git commit)
```
Commit format: conventional commits (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci`).
