import { main } from "./main.mjs";

try {
  await main();
} catch (err) {
  console.error(`[linear-status] Fatal: ${err.message}`);
  process.exit(1);
}
