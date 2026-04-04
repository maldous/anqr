import { PORT } from "./port.mjs";
import { WORKTREE_IDS } from "./worktree-ids.mjs";

export function handleHealth(res) {
  const status = {
    status: "ok",
    port: PORT,
    worktrees: WORKTREE_IDS,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status));
}
