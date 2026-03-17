export function trimRoutePath(pathname: string): string {
  let end = pathname.length;
  while (end > 1 && pathname[end - 1] === "/") end -= 1;
  return pathname.slice(0, end) || "/";
}
