#!/usr/bin/env node

/**
 * discord-source.mjs - Detect if a Linear issue originated from Discord
 *
 * Used by pickIssue() routing logic to determine which worktree type
 * should process an issue (Discord worktrees vs Linear worktrees).
 *
 * Detection methods:
 * 1. Issue has a Discord label (configured via DISCORD_LABEL_ID)
 * 2. Issue creator is the Discord bot user
 */

import { getIssueState, patchIssueState } from "./symphony-state.mjs";

/**
 * Check if an issue was created from Discord based on labels or creator
 * @param {Object} issueData - Issue data from Linear API (with labels.nodes and createdBy)
 * @returns {boolean} - True if issue is Discord-sourced
 */
export function isDiscordSourced(issueData) {
  if (!issueData) return false;

  const discordLabelId = process.env.DISCORD_LABEL_ID || process.env.LINEAR_DISCORD_LABEL_ID;

  // Check for Discord label
  if (discordLabelId) {
    const labels = issueData.labels?.nodes || [];
    const hasDiscordLabel = labels.some(
      (l) => l.id === discordLabelId || l.name.toLowerCase().includes("discord")
    );
    if (hasDiscordLabel) return true;
  }

  // Check if creator is Discord bot
  const createdBy = issueData.createdBy;
  if (createdBy) {
    const creatorIsDiscord =
      createdBy.email?.toLowerCase().includes("discord") ||
      createdBy.name?.toLowerCase().includes("discord") ||
      createdBy.id === process.env.DISCORD_BOT_USER_ID;
    if (creatorIsDiscord) return true;
  }

  return false;
}

/**
 * Mark an issue as Discord-sourced in symphony-state
 * @param {string} issueIdentifier - The Linear issue identifier (e.g., "ANQR-123")
 */
export function markDiscordSource(issueIdentifier) {
  const state = getIssueState(issueIdentifier);
  if (state.source !== "discord") {
    patchIssueState(issueIdentifier, { ...state, source: "discord" });
  }
}

/**
 * Check and mark Discord source for an issue
 * @param {Object} issueData - Issue data from Linear API
 * @param {string} issueIdentifier - The Linear issue identifier
 * @returns {boolean} - True if issue was marked as Discord-sourced
 */
export function detectAndMarkDiscordSource(issueData, issueIdentifier) {
  if (isDiscordSourced(issueData)) {
    markDiscordSource(issueIdentifier);
    return true;
  }
  return false;
}