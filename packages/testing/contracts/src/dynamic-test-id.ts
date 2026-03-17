import { allocateUniqueId } from "./allocate-unique-id";

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};
