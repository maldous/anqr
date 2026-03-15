# Architecture Standards

## Core rules

1. `apps/*` are delivery targets.
2. `packages/*` are the reusable architecture.
3. `tools/harness/*` is the operating engine.
4. Every file has one clear owner.
5. Domain stays runtime-agnostic.
6. Platform owns environment/runtime boundaries.
7. No generic sinks at broad scope.

## Forbidden broad buckets

- `core`
- `common`
- `helpers`
- `misc`
- `utils`
- `types`
- `data`
- `store`

A narrow local file may use one of these names only where the scope is obvious and tightly bounded.

## TypeScript baseline

- ESM-first
- `isolatedModules: true`
- `verbatimModuleSyntax: true`
- named exports by default
- `import type` / `export type`
- explicit package public APIs with `exports`

## Naming

- folders: kebab-case
- non-React files: kebab-case
- React components: `PascalCase.component.tsx`
- hooks: `use-*.hook.ts`
- adapters: `*.adapter.ts`
- services: `*.service.ts`
- models: `*.model.ts`
- stores: `*.store.ts`
