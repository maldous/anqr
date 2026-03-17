import type { PageDefinition, StaticPageType } from "./types";

export const staticModules = import.meta.glob<Record<StaticPageType, PageDefinition>>(
  [
    "./*/index.ts",
    "!./txt/index.ts",
    "!./rm/index.ts",
    "!./en-AU/index.ts",
    "!./en-CA/index.ts",
    "!./en-IN/index.ts",
    "!./en-SG/index.ts",
    "!./en-ZA/index.ts",
    "!./fa-AE/index.ts",
    "!./fa-IR/index.ts",
  ],
  {
    import: "*",
    eager: false,
  },
);
