import { run } from "./run.mjs";

export function indexMail() {
  const which = run("which", ["notmuch"]);
  if (which.status !== 0) return { ok: false, reason: "notmuch not installed" };
  const proc = run("notmuch", ["new"], { timeout: 30_000 });
  return { ok: proc.status === 0 };
}
