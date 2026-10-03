/** Only approved local or HTTPS assets may be rendered. Missing media stays explicit. */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  if (path.startsWith("https://")) return path;
  return undefined;
}
