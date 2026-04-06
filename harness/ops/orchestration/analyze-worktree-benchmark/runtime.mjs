
import { main } from "./index.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
