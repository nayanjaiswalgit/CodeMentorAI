export function getUniqueValues<T>(arr: T[], key: keyof T): string[] {
  return Array.from(new Set(arr.map(item => (item[key] as string) || ""))).filter(Boolean);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
