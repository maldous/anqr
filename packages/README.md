# Packages contract

`packages/*/*` are the reusable architecture.

Every leaf package must have:

- a root `README.md`
- a `package.json`
- a `tsconfig.json`
- a stable public entry (`src/index.ts`)

No leaf package may act as a generic dump.
