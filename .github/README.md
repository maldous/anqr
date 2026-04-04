# GitHub Configuration

## Issue Tracking

**GitHub Issues are disabled for this repository.**

All issue tracking, project management, and task coordination is managed through **Linear**.

- **Linear Workspace**: ANQR 1.0
- **Workspace Documentation**: See `docs/harness/03-workspace-governance.md`
- **Issue Template**: See `docs/harness/workspace/issue-template.md`

## CI/CD

GitHub Actions CI is currently disabled due to billing constraints. Quality gates are enforced through:

- Local pre-commit hooks (lefthook)
- Harness automation (`harness/ops/`)
- Netlify build pipeline

See `docs/harness/05-quality-gates.md` for the complete quality gate matrix.

## Contributing

For contribution guidelines and workflow, see:

- `docs/harness/01-operating-model.md`
- `docs/harness/04-control-flow.md`
