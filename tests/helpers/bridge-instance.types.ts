import type { ChildProcess } from "node:child_process";

export interface BridgeInstance {
  process: ChildProcess;
  port: number;
  baseUrl: string;
  apiKey: string;
  cleanup: () => Promise<void>;
}
