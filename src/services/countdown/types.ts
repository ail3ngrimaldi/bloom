/** When a discount that really ends begins and ends. */
export interface DiscountWindow {
  /** ms since epoch. */
  grantedAt: number
  /** ms since epoch. */
  expiresAt: number
}

/**
 * The authority behind the discount countdown (guardrail 5 of PLAN-B 2, 6.5). The countdown is
 * only honest if the discount really ends, so the time it counts against comes from here and not
 * from a field of the page. In production this is the server that grants the discount; until
 * there is one (phase 8) the mock below uses the browser's clock and the funnel keeps the window
 * in sessionStorage, which survives a reload but not a determined user.
 */
export interface CountdownService {
  /** The current time, ms since epoch, as the authority sees it. */
  now(): number
  /** Opens the discount window of `seconds`, starting now. */
  open(seconds: number): DiscountWindow
}
