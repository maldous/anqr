import { fileURLToPath } from "node:url";

export const isMain = process.argv[1] === fileURLToPath(import.meta.url);
