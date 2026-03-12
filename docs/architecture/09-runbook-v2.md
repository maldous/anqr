# 09. Runbook

This runbook is the corrected executable procedure.

It is designed to work in two situations:

- you have **already run** the original direct-move pass and need to stabilise the branch
- you are starting the corrected direct-move pass from a clean baseline

---

## 0. Preconditions

- repository root is the working directory
- `tsconfig.json` is the project source of truth
- `npm run typecheck` works on the baseline before a new move pass
- you have copied the contents of this package into the repository under:
  - `tools/refactor`
  - `manifests`
  - `docs/architecture` or any documentation location you prefer

---

## 1. Add scripts to `package.json`

Use `tools/refactor/package-json.snippet.json`.

Minimum required scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "extract:ast": "tsx tools/refactor/extract-ast-v3.ts",
    "refactor:move": "tsx tools/refactor/move-by-manifest-v2.ts",
    "refactor:rescue-v1": "tsx tools/refactor/rescue-v1-run.ts",
    "depcruise": "dependency-cruiser -c config/dependency-cruiser.cjs src"
  }
}
```

Recommended dev dependencies:

```bash
npm i -D ts-morph typescript tsx dependency-cruiser eslint-plugin-boundaries eslint-import-resolver-typescript
```

---

## 2. If you already ran the old move pass

Run this first on the existing refactor branch:

```bash
npm run refactor:rescue-v1 -- --manifest manifests/file-move-manifest.full.json
npm run typecheck
npm run depcruise
npm run extract:ast
```

### What the rescue does

It performs three repairs:

1. reverts these two unsafe first-pass moves:
   - `src/app/i18n/index.ts` back to `src/i18n/index.ts`
   - `src/domain/render/animation/parsing.ts` back to `src/modules/animation/parsing.ts`
2. recreates compatibility shims at the original paths for all other moved files
3. reverses the incorrect alias-prefix rewrites produced when an `index.ts` file was moved as though the entire directory had moved

### Dry run option

```bash
npm run refactor:rescue-v1 -- --manifest manifests/file-move-manifest.full.json --dry-run
```

If the rescue succeeds and the branch is green, commit that rescue as its own commit.

---

## 3. If you want the cleanest restart

If you do **not** need to preserve the previously-run move pass on the branch, reset the branch before rerunning the corrected direct-move pass.

### If the previous move run is not committed

```bash
git reset --hard HEAD
git clean -fd
```

### If the previous move run is committed

Reset to the last known-good commit before the original move pass:

```bash
git log --oneline
git reset --hard <last-known-good-commit>
```

Then continue with the corrected direct-move pass below.

---

## 4. Create the target directories

```bash
mkdir -p src/app/{boot,shell,routing,pages,search}
mkdir -p src/ui/{primitives,composites,hooks}
mkdir -p src/features/{generator,analyze,gallery,share,onboarding,monetization}
mkdir -p src/state/{model,stores,selectors}
mkdir -p src/domain/qr/{spec,encode,decode,analyze,qart}
mkdir -p src/domain/render/{primitives,color,dither,filters,overlay,animation,generator,export}
mkdir -p src/domain/payload/{generators,parsers,serializers,model}
mkdir -p src/domain/share/model
mkdir -p src/platform/browser/{canvas,clipboard,io,boot}
mkdir -p src/platform/native/{ads,media-store,notifications}
mkdir -p src/platform/worker/{analyze,qart}
mkdir -p src/infra/{logging,telemetry,diagnostics,testing,utilities}
mkdir -p src/content/{gallery,i18n,generated}
```

---

## 5. Baseline verification

Before the corrected move pass:

```bash
npm run extract:ast
npm run typecheck
npm run depcruise
```

If the baseline is not green, stop and correct that first.

---

## 6. Run the corrected direct-move pass

### Dry run

```bash
npm run refactor:move -- --manifest manifests/file-move-manifest.safe.json --dry-run
```

### Real run

```bash
npm run refactor:move -- --manifest manifests/file-move-manifest.safe.json
```

### What this corrected move pass does

It intentionally uses a safer migration strategy:

- it moves only the safe direct-move set
- it creates compatibility shims at the **old** paths so the existing imports still compile
- it does **not** try to rewrite every consumer to the new paths in the same pass
- it fixes triple-slash reference paths inside moved files
- it writes a report to `out/refactor-move-report.json`

### Verify immediately after the move

```bash
npm run typecheck
npm run depcruise
npm run extract:ast
```

Commit the direct moves after the branch is green.

---

## 7. What not to do in the direct-move pass

Do **not** do any of the following in the same commit as the direct moves:

- remove compatibility shims
- rewrite imports repo-wide to the new target paths
- split any of the critical mixed files
- delete broad barrels
- move `src/i18n/index.ts`
- move `src/modules/animation/parsing.ts`

Those are later-phase changes.

---

## 8. Proceed to symbol splits only after the direct-move pass is green

Critical split order:

1. `src/App.tsx`
2. `src/hooks/useQRGenerator.ts`
3. `src/components/Analyze.tsx`
4. `src/store/qr-store.ts`
5. `src/modules/qr-generator/qr-generator-class.ts`

For each file:

1. move models, enums, constants, and pure helpers first
2. move application services and orchestration second
3. leave a thin façade temporarily if required
4. rerun verification after each split
5. commit one critical split per commit

---

## 9. Remove compatibility shims only after consumer rewrites

Compatibility shims are deliberate and temporary.

Only remove a shim when:

- all imports and dynamic imports have been rewritten to the new target path
- the old path is no longer referenced
- typecheck and depcruise are green without the shim

---

## 10. Required command set

```bash
npm run extract:ast
npm run typecheck
npm run depcruise
npm run refactor:rescue-v1 -- --manifest manifests/file-move-manifest.full.json
npm run refactor:move -- --manifest manifests/file-move-manifest.safe.json --dry-run
npm run refactor:move -- --manifest manifests/file-move-manifest.safe.json
```

---

## 11. Completion checkpoint for the corrected direct-move pass

- [ ] baseline was green before moves
- [ ] rescue was run if the original move pass had already been executed
- [ ] corrected safe manifest was used
- [ ] compatibility shims were created at original paths
- [ ] typecheck is green after the move pass
- [ ] depcruise is green or only shows pre-existing warnings
- [ ] inventory refreshed and committed

Only after those are complete should symbol splitting resume.
