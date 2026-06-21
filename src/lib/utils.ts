/** Joins class names, filtering out falsy values. Keeps components free of an extra dependency. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
