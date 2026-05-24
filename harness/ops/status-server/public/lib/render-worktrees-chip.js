import { $ } from "./dom-query.js";

export function renderWorktreesChip(wts) {
  const el = $("#worktreesChip");
  if (!wts) { el.style.display = "none"; return; }
  el.textContent = `${wts.executing}/${wts.total} worktrees running`;
  el.className = `chip ${wts.executing > 0 ? "chip-green" : "chip-muted"}`;
  el.style.display = "";
}
