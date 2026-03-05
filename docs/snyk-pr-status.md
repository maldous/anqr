# Snyk PR status context (`security/snyk (maldous)`)

This repository publishes a deterministic commit status context for pull requests:

- Context name: `security/snyk (maldous)`
- Source workflow: `.github/workflows/snyk-pr-status.yml`
- Trigger: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`)

## Behavior

The workflow runs `snyk test --all-projects --severity-threshold=high` and always maps the result to a GitHub commit status of either:

- `success`: no blocking vulnerabilities were found
- `failure`: blocking vulnerabilities found, token missing, or Snyk execution/runtime error

No `error` state is emitted for this context; integration/runtime problems are surfaced as `failure` with a specific description.

## Required configuration

Set repository secret:

- `SNYK_TOKEN`: Snyk API token with access to the relevant org/projects

GitHub Actions permissions required by the workflow:

- `statuses: write`
- `contents: read`
- `pull-requests: read`

## Health monitoring and troubleshooting

Primary health surfaces:

- PR check context: `security/snyk (maldous)`
- Workflow runs: Actions -> `Snyk PR Status`

Troubleshooting flow:

1. Open the failed workflow run linked from the status `target_url`.
2. Check `Run Snyk and classify result` output for classification:
   - `missing_token`: add/fix `SNYK_TOKEN` secret
   - `vulns`: resolve or suppress blocking vulnerabilities per policy
   - `cli_error`: investigate Snyk CLI/runtime outage or auth issues
3. Re-run the workflow from the PR after remediation.
