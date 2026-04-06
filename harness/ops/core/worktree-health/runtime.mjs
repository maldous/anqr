import { getFleetInventory, getWorktreeHealthSnapshot, writeFleetHealthFile } from "./index.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2];
  if (cmd === "snapshot") {
    const wtId = process.argv[3];
    if (!wtId) {
      console.error("Usage: worktree-health.mjs snapshot <worktreeId>");
      process.exit(2);
    }
    console.log(JSON.stringify(getWorktreeHealthSnapshot(wtId), null, 2));
  } else if (cmd === "inventory") {
    console.log(JSON.stringify(getFleetInventory(), null, 2));
  } else if (cmd === "write") {
    writeFleetHealthFile(process.argv[3]);
  } else {
    console.error("Usage: worktree-health.mjs <snapshot <id>|inventory|write [path]>");
    process.exit(2);
  }
}
