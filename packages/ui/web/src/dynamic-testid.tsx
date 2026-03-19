import { allocateUniqueId } from "./dynamic-testid-allocate";

export type { TestIdProps } from "./dynamic-testid-props.types";

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};

export { allocateUniqueId } from "./dynamic-testid-allocate";
export { normalizeToken } from "./dynamic-testid-normalize";
export { getElementToken } from "./dynamic-testid-element-token";
export { ensureElementTestId } from "./dynamic-testid-ensure";
export { assignInTree } from "./dynamic-testid-assign";
export { initAutoDynamicTestIds } from "./dynamic-testid-init";
export { useDynamicTestId } from "./dynamic-testid-hook";
