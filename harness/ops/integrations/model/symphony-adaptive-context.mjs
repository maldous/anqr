#!/usr/bin/env node
/**
 * Symphony Adaptive Context — IN-PROCESS EPHEMERAL behavior.
 *
 * dynamicMaxTokens shrinks on 413/context-too-large errors and slowly
 * recovers on successive successes. This state is ENTIRELY IN-MEMORY
 * per bridge process instance — it does NOT persist across bridge
 * restarts and is NOT shared between worktree executor instances.
 *
 * This is intentional: each bridge process independently learns its
 * own provider context limits within its lifetime. On restart, limits
 * reset to the configured base values and are re-learned naturally.
 *
 * NOT durable learning. NOT cross-process. NOT cross-restart.
 */
export * from "./symphony-adaptive-context/index.mjs";
