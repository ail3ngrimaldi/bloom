import Link from 'next/link'
import { Card, Header, PageShell } from '@/ui'
import { isDevToolsEnabled } from '@/lib/env'
import styles from './Home.module.css'

/** Placeholder landing: phase 2a replaces it with a redirect into the funnel. */
export default function HomePage() {
  return (
    <PageShell theme="lilac">
      <Card>
        <Header />
        <main className={styles.main}>
          <h1 className={styles.title}>Bloom</h1>
          <p className={styles.text}>The onboarding funnel is being built.</p>
          {isDevToolsEnabled() && (
            <Link className={styles.link} href="/__gallery">
              Open the UI gallery
            </Link>
          )}
        </main>
      </Card>
    </PageShell>
  )
}
