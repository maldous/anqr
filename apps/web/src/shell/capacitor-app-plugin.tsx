export type CapacitorAppPlugin = {
  exitApp?: () => Promise<void> | void;
};
