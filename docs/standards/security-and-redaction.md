# Security and Redaction

## Rules

- no secrets in git
- no secrets in docs uploaded to ChatGPT
- no secrets in logs or telemetry
- no secrets in crash reports
- no raw signing material in the bootstrap branch
- external service credentials must have clear ownership

## Required pre-bootstrap review

- tracked secret scan
- CI secret review
- systemd/unit secret review
- Netlify/Cloudflare secret review
- Google/Apple/Sentry/GA/AdMob credential review
- remediation and rotation plan
