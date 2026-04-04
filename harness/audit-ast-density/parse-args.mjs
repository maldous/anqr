// Generated from ../scripts/audit-ast-density.mjs:20

import { DEFAULT_THRESHOLD } from "./default-threshold.mjs";

export const parseArgs = (argv) => {
  const options = {
    threshold: DEFAULT_THRESHOLD,
    json: false,
    paths: [],
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--threshold") {
      i += 1;
      const raw = argv[i];
      if (raw === undefined) {
        throw new Error("--threshold requires a numeric value");
      }
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid threshold: ${raw}`);
      }
      options.threshold = parsed;
    } else {
      options.paths.push(arg);
    }
    i += 1;
  }

  return options;
};
