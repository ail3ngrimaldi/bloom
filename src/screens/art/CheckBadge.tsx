import { cx } from '@/ui/cx'
import styles from './art.module.css'

/** Green round badge with a white check (the match, PLAN 5.6 #25 item 2). */
export function CheckBadge({ className }: { className?: string }) {
  return (
    <span className={cx(styles.check, className)} aria-hidden="true">
      <svg viewBox="0 0 20 20" focusable="false">
        <path d="M5 10.4 8.4 13.6 15 6.8" />
      </svg>
    </span>
  )
}
