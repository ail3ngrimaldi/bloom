import type { ReactNode } from 'react'
import { cx } from '../cx'
import styles from './QuizLayout.module.css'

export interface QuizLayoutProps {
  /** Usually a Header. With it, the content starts at +124 from the card top. */
  header?: ReactNode
  /** Pinned to the bottom with a 26px margin (the CTA). */
  footer?: ReactNode
  /**
   * 'top' anchors the content under the header (single-select). 'center' centres it in the space
   * above the footer, a little higher than true centre (multi-select, capture).
   */
  align?: 'top' | 'center'
  className?: string
  children: ReactNode
}

/** Vertical structure shared by question screens; place it inside a Card (or a StepTransition). */
export function QuizLayout({
  header,
  footer,
  align = 'top',
  className,
  children,
}: QuizLayoutProps) {
  return (
    <div
      className={cx(styles.layout, align === 'center' ? styles.center : styles.top, className)}
      data-has-header={header ? '' : undefined}
    >
      {header}
      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
