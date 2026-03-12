# ANQR v3 i18n rescue fix

This patch fixes the remaining post-rescue failures caused by the reverted `src/i18n/index.ts` move.

## What it fixes

- creates `src/app/i18n/index.ts` as a compatibility shim
- repairs `src/i18n/index.ts` paths that still point to `../../i18n/...`
- patches the rescue script so future runs also handle exact alias rewrites and keep a forward shim for reverted moves

## Apply immediately

Copy the files into your repo, then run:

```bash
cp /path/to/repair-i18n-post-rescue.ts tools/refactor/
cp /path/to/rescue-v1-run.ts tools/refactor/
npx tsx tools/refactor/repair-i18n-post-rescue.ts
npm run typecheck
```

If you need to re-run the rescue after replacing the script:

```bash
npm run refactor:rescue-v1 -- --manifest manifests/file-move-manifest.full.json
npm run typecheck
```
