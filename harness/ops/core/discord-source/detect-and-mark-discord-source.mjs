import { isDiscordSourced } from "./is-discord-sourced.mjs";
import { markDiscordSource } from "./mark-discord-source.mjs";

export function detectAndMarkDiscordSource(issueData, issueIdentifier) {
  if (isDiscordSourced(issueData)) {
    markDiscordSource(issueIdentifier);
    return true;
  }
  return false;
}
