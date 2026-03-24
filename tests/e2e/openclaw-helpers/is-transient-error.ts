export function isTransientError(status: number, errMsg: string): boolean {
  if (status === 0) return true;
  if (status === 429) return true;
  if (
    status === 500 &&
    /Too Many Requests|rate.limit|quota|exhausted|system memory|not enough memory|out of memory/i.test(
      errMsg,
    )
  )
    return true;
  if (status === 503) return true;
  return false;
}
