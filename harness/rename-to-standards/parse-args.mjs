// Generated from ../scripts/rename-to-standards.mjs:13

import process from "node:process";
import path from "node:path";

import { DEFAULT_DIRS } from "./default-dirs.mjs";

export const parseArgs = (argv) => {
  const options = {
    apply: false,
    json: false,
    root: process.cwd(),
    dirs: [...DEFAULT_DIRS],
  };

  let index = 0;
  while (index < argv.length) {
    const arg = argv[index];
    if (arg === "--apply") {
      options.apply = true;
      index += 1;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      index += 1;
      continue;
    }
    if (arg === "--root") {
      const nextArg = argv[index + 1];
      options.root = path.resolve(nextArg);
      index += 2;
      continue;
    }
    if (arg === "--dirs") {
      const nextArg = argv[index + 1];
      options.dirs = nextArg
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      index += 2;
      continue;
    }
    index += 1;
  }

  return options;
};
