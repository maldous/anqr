import { main } from "./index.mjs";

main().catch((err) => {
  console.error(`[scheduler] Fatal: ${err.message}`);
  process.exit(1);
});
