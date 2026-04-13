export function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* intentional sync wait — kept short by backoff cap */
  }
}
