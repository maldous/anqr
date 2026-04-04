import { AsyncLocalStorage } from "node:async_hooks";

export const requestCwdStorage = new AsyncLocalStorage();
