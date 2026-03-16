import type { StoreState } from "./share-config-store-state.type";

export type BuildShareConfigInput = Readonly<{
  getPayloadText: () => string;
  qr: StoreState["qr"];
  render: StoreState["render"];
  overlay: StoreState["overlay"];
  animation: StoreState["animation"];
  output: StoreState["output"];
  safety: StoreState["safety"];
  qa: StoreState["qa"];
  auto: StoreState["auto"];
  watermark: StoreState["watermark"];
  metadata: StoreState["metadata"];
}>;
