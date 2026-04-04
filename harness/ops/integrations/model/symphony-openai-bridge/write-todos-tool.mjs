import { logInfo } from "./logger.mjs";
export async function writeTodosTool({ todos }) {
  logInfo(`📋 Write todos: ${todos.length} items`);
  return { acknowledged: true, count: todos.length, todos };
}
