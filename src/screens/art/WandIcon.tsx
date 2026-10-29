import styles from './art.module.css'

/** Magic wand with sparkles (PLAN 5.5 item 1). TODO(content): placeholder art. */
export function WandIcon() {
  return (
    <svg className={styles.wand} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M9 32 25 16" stroke="#6454fe" strokeWidth="4" strokeLinecap="round" />
      <path d="M25 16 28 13" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      <g fill="#f6b73c">
        <path d="M31 4 32.4 8.6 37 10 32.4 11.4 31 16 29.6 11.4 25 10 29.6 8.6Z" />
        <path d="M20 5 20.8 7.2 23 8 20.8 8.8 20 11 19.2 8.8 17 8 19.2 7.2Z" />
        <path d="M35 19 35.6 20.4 37 21 35.6 21.6 35 23 34.4 21.6 33 21 34.4 20.4Z" />
      </g>
    </svg>
  )
}
