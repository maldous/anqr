// Generated from ../scripts/rename-to-standards.mjs:404

import process from "node:process";
import path from "node:path";

import { applyPlan } from "./apply-plan.mjs";
import { buildPlan } from "./build-plan.mjs";
import { parseArgs } from "./parse-args.mjs";
import { partitionCollisions } from "./partition-collisions.mjs";
import { walk } from "./walk.mjs";

export const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const root = options.root;
  const filePaths = options.dirs.flatMap((dir) => walk(path.join(root, dir)));
  const plan = buildPlan(root, filePaths);
  const { accepted, skipped } = partitionCollisions(plan);

  if (!options.apply) {
    if (options.json) {
      process.stdout.write(`${JSON.stringify({ accepted, skipped }, null, 2)}\n`);
      return;
    }
    for (const item of accepted) {
      process.stdout.write(
        `${item.oldRelativePath} -> ${item.newRelativePath}  [${item.reason}]\n`,
      );
    }
    if (skipped.length > 0) {
      process.stdout.write(`\n# skipped due to collisions\n`);
      for (const item of skipped) {
        process.stdout.write(
          `${item.oldRelativePath} -> ${item.newRelativePath}  [${item.reason}]\n`,
        );
      }
    }
    return;
  }

  applyPlan(root, filePaths, accepted);
  if (skipped.length > 0) {
    process.stdout.write(`skipped ${skipped.length} conflicting renames\n`);
  }
};
