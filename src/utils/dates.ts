export function toIsoDate(value: string | null): string {
    if (!value) return "";
    const [day, month, year] = value.split("/");
    if (!year) return value; // no slashes: already "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }

export function parseDjangoDateTime(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}))?/.exec(value);
  if (!match) return null; 
  const [, day, month, year, hours = "0", minutes = "0"] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
}

export function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}
