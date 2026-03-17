// ---------------------------------------------------------------------------
// 11. Calendar event parser
// ---------------------------------------------------------------------------
export function formatICalDateTime(dt: string): string {
  try {
    const isAllDay = dt.length === 8;
    const year = Number.parseInt(dt.slice(0, 4), 10);
    const month = Number.parseInt(dt.slice(4, 6), 10) - 1;
    const day = Number.parseInt(dt.slice(6, 8), 10);
    let hours = 0,
      minutes = 0;

    if (!isAllDay && dt.includes("T")) {
      const timePart = dt.split("T")[1];
      hours = Number.parseInt(timePart.slice(0, 2), 10);
      minutes = Number.parseInt(timePart.slice(2, 4), 10);
    }

    const date = new Date(year, month, day, hours, minutes);

    if (isAllDay) {
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}
