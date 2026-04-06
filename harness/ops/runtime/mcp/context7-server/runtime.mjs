import { handleShutdown } from "./index.mjs";

process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("SIGINT", () => handleShutdown("SIGINT"));
