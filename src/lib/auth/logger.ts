export function logAuthEvent(
  event: string,
  details: Record<string, unknown> = {}
): void {
  const payload = JSON.stringify(details)
  console.info(`[auth] ${event} ${payload}`)
}
