import { args } from "./args.mjs";

export const bridgeArg = args.find((a) => a.startsWith("--bridge="))?.split("=")[1] || "both";
