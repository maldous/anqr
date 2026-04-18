# Environments and Secrets

## Objective

Document environments, secret sources, and remediation needs.

## Fill in

### Environments

- local : confirmed
- dev : confirmed
- staging : not used
- prod : confirmed
- TestFlight / internal track : confirmed
- other : not used

### Secret sources

- GitHub secrets : confirmed
- systemd Environment : confirmed
- local env files : confirmed
- Netlify : confirmed
- Cloudflare : confirmed
- Google / Apple credentials : confirmed
- Sentry / analytics / ads keys : confirmed
- others : not used

### Redaction review

- Tracked secrets found: confirmed
- Files/locations: confirmed
- Remediation performed: confirmed
- Rotations required: confirmed
- Owners: confirmed

### Rules

- no secrets in git: confirmed
- no secrets in docs uploaded to ChatGPT: confirmed
- no secrets in logs: confirmed
- no secrets in crash reports: confirmed
