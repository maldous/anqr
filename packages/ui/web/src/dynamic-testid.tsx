import { allocateUniqueId } from "./dynamic-testid-allocate";

export type { TestIdProps } from "./dynamic-testid-props.types";

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};

export { useDynamicTestId } from "./dynamic-testid-hook";
