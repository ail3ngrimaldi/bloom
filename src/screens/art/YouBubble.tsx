import { cx } from '@/ui/cx'
import styles from './art.module.css'

/** The "You" circle of the intro and the match (PLAN 5.2, item 3). */
export function YouBubble({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cx(styles.you, className)}>
      <span>{label}</span>
    </div>
  )
}
