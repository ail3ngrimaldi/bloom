import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../cx'
import styles from './QuestionTitle.module.css'

export interface QuestionTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  /** id of the heading itself, to name a control with the question alone (aria-labelledby). */
  titleId?: string
  /** id of the subtitle, to describe a control with it (aria-describedby). */
  subtitleId?: string
}

/** Question heading (20/24 bold) with an optional subtitle 4px below; 24px of air underneath. */
export function QuestionTitle({
  title,
  subtitle,
  titleId,
  subtitleId,
  className,
  ...rest
}: QuestionTitleProps) {
  return (
    <div {...rest} className={cx(styles.block, className)}>
      <h1 id={titleId} className={styles.title}>
        {title}
      </h1>
      {subtitle !== undefined && (
        <p id={subtitleId} className={styles.subtitle}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
