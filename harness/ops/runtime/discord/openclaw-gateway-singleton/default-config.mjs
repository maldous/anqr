import path from "node:path";

import { WORKTREE_PATH } from "./worktree-path.mjs";

export const DEFAULT_CONFIG = path.join(WORKTREE_PATH, ".openclaw", "openclaw.json");
