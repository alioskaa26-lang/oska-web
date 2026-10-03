/** Local error hook; external reporting is intentionally unconfigured. */
export function reportLovableError(error: Error, context: { boundary: string }) {
  console.error(`[OSKA: ${context.boundary}]`, error);
}
