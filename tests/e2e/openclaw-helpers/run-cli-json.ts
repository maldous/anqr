import { runCli } from "./run-cli";

export function runCliJson<T = Record<string, unknown>>(args: string, timeoutMs = 15_000): T {
  const raw = runCli(args, timeoutMs);
  return JSON.parse(raw) as T;
}
