# 09. Runbook

This runbook is designed to be executable without additional clarification.

## 0. Preconditions

- repository is clean
- current tests pass or known failures are documented
- `tsconfig.json` resolves project aliases correctly
- the inventory zip has already been generated once

## 1. Install tooling

Add the packages from `tools/refactor/package-json.snippet.json`.

Recommended dev dependencies:
- `ts-morph`
- `typescript`
- `tsx`
- `dependency-cruiser`
- `eslint-plugin-boundaries`
- `eslint-import-resolver-typescript`

## 2. Create branch

```bash
git checkout -b refactor/anqr-architecture
```

## 3. Copy package contents into the repository

```bash
mkdir -p tools/refactor config manifests/symbol-splits docs/architecture
cp -R docs/* docs/architecture/
cp config/* config/
cp manifests/file-move-manifest.* manifests/
cp -R manifests/symbol-splits manifests/
cp tools/refactor/* tools/refactor/
```

If you prefer, keep the docs outside the repository and only commit the configs, manifests, and tools.

## 4. Add scripts to `package.json`

Use `tools/refactor/package-json.snippet.json` as the source of truth.

## 5. Baseline verification

```bash
npm run extract:ast
npm run typecheck
npm run depcruise
```

If dependency-cruiser is newly added, allow warning-mode output at this step.

## 6. Create the target folders

```bash
mkdir -p src/app/{{boot,shell,routing,pages,i18n,search}}
mkdir -p src/ui/{{primitives,composites,hooks}}
mkdir -p src/features/{{generator,analyze,gallery,share,onboarding,monetization}}
mkdir -p src/state/{{model,stores,selectors}}
mkdir -p src/domain/qr/{{spec,encode,decode,analyze,qart}}
mkdir -p src/domain/render/{{primitives,color,dither,filters,overlay,animation,generator,export}}
mkdir -p src/domain/payload/{{generators,parsers,serializers,model}}
mkdir -p src/domain/share/model
mkdir -p src/platform/browser/{{canvas,clipboard,io,boot}}
mkdir -p src/platform/native/{{ads,media-store,notifications}}
mkdir -p src/platform/worker/{{analyze,qart}}
mkdir -p src/infra/{{logging,telemetry,diagnostics,testing,utilities}}
mkdir -p src/content/{{gallery,i18n,generated}}
```

## 7. Run deterministic direct moves

### Dry run
```bash
npm run refactor:move -- --manifest manifests/file-move-manifest.json --dry-run
```

Review the output.

### Real run
```bash
npm run refactor:move -- --manifest manifests/file-move-manifest.json
```

### Verify
```bash
npm run typecheck
npm run depcruise
npm run extract:ast
```

Commit the direct moves.

## 8. Remove broad barrels

Delete only after references are gone:
- `src/modules/index.ts`
- `src/modules/core/index.ts`
- other barrel files marked as `delete` or `split`

Run verification again.

## 9. Split the critical files in order

### Order
1. `src/App.tsx`
2. `src/hooks/useQRGenerator.ts`
3. `src/components/Analyze.tsx`
4. `src/store/qr-store.ts`
5. `src/modules/qr-generator/qr-generator-class.ts`

### Method
For each file:
1. open the matching manifest in `manifests/symbol-splits/`
2. create the destination files listed
3. move helpers/constants/models first
4. move application services second
5. reduce the source file to a thin façade temporarily if needed
6. update imports to the new files
7. rerun verification
8. delete the façade when stable

Do not split more than one critical file in a single commit.

## 10. Decompose `src/modules/qr-generator/**`

After the five critical splits:
1. move direct `qr-generator` files already classified as `move`
2. split `api.ts`, `index.ts`, `types.ts`, `utils.ts`, `cache.ts`, and `qr-generator-class.ts`
3. consolidate duplicate color and dithering responsibilities
4. keep browser canvas factory under `platform/browser/canvas`

## 11. Normalise type ownership

Move:
- QR-specific enums to `src/domain/qr/**`
- render and output enums to `src/domain/render/**`
- payload helper types and serializers to `src/domain/payload/**`
- monetization tier models out of the store

Keep only state models and store logic under `src/state/**`.

## 12. Enable strict enforcement

Once the move and split work is stable:
1. promote dependency-cruiser violations from warning to error
2. enable eslint boundaries in the default lint command
3. add architecture checks to CI required status checks

## 13. Required command set

```bash
npm run extract:ast
npm run typecheck
npm run depcruise
npm run refactor:move -- --manifest manifests/file-move-manifest.json --dry-run
npm run refactor:move -- --manifest manifests/file-move-manifest.json
```

## 14. Completion checklist

- [ ] all direct moves applied
- [ ] all five critical mixed files split
- [ ] `src/modules/index.ts` removed
- [ ] no global barrels remain
- [ ] `src/store/qr-store.ts` no longer owns domain taxonomy
- [ ] `src/modules/qr-generator/**` is decomposed by responsibility
- [ ] architecture rules enforced in CI
- [ ] inventory refreshed and committed