import { qartModulePromiseState } from './qart-module-promise-state';

export function getQartModulePromise() {
  return qartModulePromiseState.current;
}
