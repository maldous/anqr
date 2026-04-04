export function isSupportedEnvName(name) {
  return /^\.env(?:\..+)?$/i.test(name);
}
