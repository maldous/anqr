import { createLogger } from "@/domain/logging";

export const _log = createLogger("GENERATE");
export { _log as log };
