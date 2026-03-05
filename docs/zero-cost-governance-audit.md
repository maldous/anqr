# Zero-Cost Governance Audit (ANQ-41)

Generated: 2026-03-05T12:18:35Z

## Reproduction (before fix)

Command:

```bash
make -n all | rg -n "\[12/16\]|\[13/16\]|deploy|indexnow|upload-to-play-store|netlify deploy|SENTRY_UPLOAD=true|Play Store"
```

Signal observed prior to changes:

- default `make all` plan included `make deploy`
- `netlify deploy --prod --site anqr.link --dir=dist`
- `make indexnow` / `node scripts/submit-indexnow.mjs`
- `python3 scripts/upload-to-play-store.py`

## Post-fix validation

### 1) Default pipeline excludes paid/external-release actions

```bash
set -euo pipefail
if make -n all | rg -n "make deploy|netlify deploy --prod|make indexnow|submit-indexnow|upload-to-play-store.py|make i18n:push"; then
  echo "FAIL"
  exit 1
else
  echo "PASS"
fi
```

Result: `PASS: make all excludes paid/external-release commands`

### 2) Block by default (no unlock env)

```bash
make deploy
make indexnow
make android:upload
```

Result for each command:

- `ERROR: Paid/external-release action blocked by default.`
- requires `ALLOW_PAID_ACTIONS=1` and `PAID_ACTION_APPROVED_BY`

### 3) Unlock path requires explicit approval metadata

```bash
ALLOW_PAID_ACTIONS=1 PAID_ACTION_APPROVED_BY=linear:ANQ-41 make -n deploy indexnow android:upload
```

Dry-run result includes guarded command plan:

- `SENTRY_UPLOAD=true npm run build`
- `netlify deploy --prod --site anqr.link --dir=dist`
- `node scripts/submit-indexnow.mjs`
- `python3 scripts/upload-to-play-store.py`

### 4) Direct script invocation is gated

```bash
node scripts/submit-indexnow.mjs
```

Result:

- `ERROR: IndexNow submission blocked by default.`

### 5) Script syntax checks

```bash
node --check scripts/submit-indexnow.mjs
python3 -m py_compile scripts/upload-to-play-store.py
```

Result: both pass.
