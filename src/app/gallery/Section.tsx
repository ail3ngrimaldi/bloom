import type { ReactNode } from 'react'
import styles from './gallery.module.css'

export function Section({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
      {children}
    </section>
  )
}

/** One demo with a caption. 365 wide by default (a 333 option plus padding); 'auto' hugs its content. */
export function Cell({
  caption,
  width = 365,
  children,
}: {
  caption: string
  width?: number | 'auto'
  children: ReactNode
}) {
  return (
    <figure className={styles.cell} style={{ width }}>
      {children}
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  )
}
