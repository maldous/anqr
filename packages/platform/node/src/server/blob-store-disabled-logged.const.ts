let _logged = false;
export const blobStoreDisabledLogged = {
  get(): boolean {
    return _logged;
  },
  set(value: boolean): void {
    _logged = value;
  },
};
