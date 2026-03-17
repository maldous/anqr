let _disabled = false;
export const blobStoreDisabled = {
  get(): boolean {
    return _disabled;
  },
  set(value: boolean): void {
    _disabled = value;
  },
};
