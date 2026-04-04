// Generated from ../../scripts/lib/ast-helpers.mjs:36

import process from "node:process";

export const setupEpipeHandler = () => {
  process.stdout.on("error", (error) => {
    if (error?.code === "EPIPE") {
      process.exit(0);
    }
    throw error;
  });
};
