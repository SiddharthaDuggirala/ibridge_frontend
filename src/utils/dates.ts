export function toIsoDate(value: string | null): string {
    if (!value) return "";
    const [day, month, year] = value.split("/");
    if (!year) return value; // no slashes: already "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }