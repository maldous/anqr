import { allocateUniqueId } from "./dynamic-testid-allocate";

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};

export { initAutoDynamicTestIds } from "./dynamic-testid-init";
