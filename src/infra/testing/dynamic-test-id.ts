import { allocateUniqueId } from './dynamic-testid._internal';

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};
