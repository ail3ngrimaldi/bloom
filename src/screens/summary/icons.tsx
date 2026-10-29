/** Line icons of the summary tiles and alert (PLAN 5.7). Decorative: aria-hidden. */

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function ThumbDownIcon() {
  return (
    <svg {...common}>
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H6.7a2 2 0 0 0-2 1.7l-1.4 9A2 2 0 0 0 5.3 15H10z" />
      <path d="M17 2h3v11h-3" />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

export function BoltIcon() {
  return (
    <svg {...common}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

export function BatteryIcon() {
  return (
    <svg {...common}>
      <rect x="6" y="4" width="12" height="18" rx="2" />
      <path d="M10 2h4" />
      <path d="M9 17h6" />
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 2.5 20h19L12 3z" fill="currentColor" />
      <path d="M12 9.5v4.5M12 17v.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
