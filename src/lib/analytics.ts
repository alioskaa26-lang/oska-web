/** Local integration hook only. No third-party script or personal form data. */
export function trackEvent(event: string, properties: { label?: string } = {}) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("oska:analytics", { detail: { event, ...properties } }));
}
export function analyticsAttrs(event: string, label: string) {
  return { "data-analytics-event": event, "data-analytics-label": label };
}
