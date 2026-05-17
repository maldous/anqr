import { main } from "./index.mjs";

try {
  await main();
} catch (err) {
  console.error(`[scheduler] Fatal: ${err.message}`);
  process.exit(1);
}
