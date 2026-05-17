import { main } from "./main.mjs";

try {
  await main();
} catch (err) {
  console.error(`[linear-reconciler] Fatal: ${err.message}`);
  process.exit(1);
}
