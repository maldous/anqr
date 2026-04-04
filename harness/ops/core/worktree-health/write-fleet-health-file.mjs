import { resolve, dirname } from "node:path";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { getFleetSnapshot } from "../symphony-state.mjs";

import { getFleetInventory } from "./get-fleet-inventory.mjs";
import { logInfo } from "./logger.mjs";

export function writeFleetHealthFile(outputPath) {
  const defaultPath = resolve(
    dirname(new URL(import.meta.url).pathname),
    "..",
    "..",
    "..",
    "..",
    "reports",
    "symphony",
    "fleet-health.json",
  );
  const targetPath = outputPath || defaultPath;
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const inventory = getFleetInventory();
  const fleetState = getFleetSnapshot();

  const report = {
    ...inventory,
    stateStore: fleetState,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(targetPath, JSON.stringify(report, null, 2) + "\n");
  logInfo(`[health] Fleet health written to ${targetPath}`);
  return targetPath;
}
