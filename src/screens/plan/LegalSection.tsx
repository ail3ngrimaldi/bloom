'use client'

import { copy } from '@/funnel/copy'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { formatLongDate } from '@/pricing/closing'
import { formatMoney } from '@/pricing/plans'
import { LegalLink } from '../paywall/Legal'
import { usePlan } from './context'
import { fillTemplate } from './template'
import styles from './sections.module.css'

const text = copyJson.steps.plan.legal

/**
 * The subscription terms under the payment block (b-13 item 1). They say what the visitor will be
 * charged, when and how often, and how to cancel; every figure and the date come from the quote, so
 * they match the plan card, the payment block and the charge. The text is as legible as the rest of
 * the sheet (12 px or more, 4.5:1) and not left for last (guardrail 4).
 */
export function LegalSection() {
  const { quote, domain } = usePlan()
  const values = {
    trialDays: quote.trialDays,
    brand: copy.brand,
    renewalPrice: <strong>{formatMoney(quote.renewalPrice)}</strong>,
    trialEndDate: <strong>{formatLongDate(quote.trialEndDate)}</strong>,
    domain: <strong>{domain}</strong>,
    terms: <LegalLink href="/legal/terms">{text.terms}</LegalLink>,
    privacy: <LegalLink href="/legal/privacy">{text.privacy}</LegalLink>,
    policy: <LegalLink href="/legal/subscription">{text.policy}</LegalLink>,
  }
  return (
    <section className={styles.legal} aria-label="Subscription terms" data-testid="legal">
      <ul className={styles.legalList}>
        {text.bullets.map((bullet) => (
          <li key={bullet}>{fillTemplate(bullet, values)}</li>
        ))}
      </ul>
    </section>
  )
}
