const dateFormat = new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" });
const monthFormat = new Intl.DateTimeFormat("en", { year: "numeric", month: "short" });

export function formatDate(iso: string | null | undefined): string | null {
  return iso ? dateFormat.format(new Date(iso)) : null;
}

export function formatMonth(iso: string | null | undefined): string | null {
  return iso ? monthFormat.format(new Date(iso)) : null;
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function listToText(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
