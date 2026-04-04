// Generated runtime carry-forward.

import { setupEpipeHandler } from "../lib/ast-helpers.mjs";
import process from "node:process";

import { main } from "./index.mjs";

setupEpipeHandler();

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
