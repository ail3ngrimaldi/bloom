import Link from 'next/link'
import { copy } from '@/funnel/copy'
import styles from './PrivacyNote.module.css'

/**
 * Notice under a question that asks for health data (PLAN 2, guardrail 4): what the answer is for,
 * that it is optional and not a diagnosis, and a visible link to the privacy policy.
 */
export function PrivacyNote({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className={styles.note}>
      {text}{' '}
      <Link className={styles.link} href="/legal/privacy" target="_blank" rel="noopener">
        {copy.common.privacyPolicy}
      </Link>
    </p>
  )
}
