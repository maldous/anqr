import { run } from "./run.mjs";

export function tagMessage(messageId, addTags = [], removeTags = []) {
  const args = [
    "tag",
    ...addTags.map((t) => `+${t}`),
    ...removeTags.map((t) => `-${t}`),
    "--",
    messageId,
  ];
  run("notmuch", args);
}
