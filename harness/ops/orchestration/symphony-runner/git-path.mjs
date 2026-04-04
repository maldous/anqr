import { resolve } from "node:path";

import { cwd } from "./cwd.mjs";

export const gitPath = resolve(cwd, ".git");
