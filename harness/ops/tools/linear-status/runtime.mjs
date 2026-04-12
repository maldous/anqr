import { main } from "./main.mjs";

main().catch((err) => {
  console.error(`[linear-status] Fatal: ${err.message}`);
  process.exit(1);
});
