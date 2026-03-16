import type { StoreState } from "./share-config-store.types";
import { assembleShareStyles } from "./assemble-share-styles";

export function buildShareStyles(render: StoreState["render"]) {
  return assembleShareStyles(render);
}
