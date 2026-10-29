import Link from 'next/link'
import { Card, Header, PageShell } from '@/ui'
import { isGalleryEnabled } from '@/lib/env'
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
          {isGalleryEnabled() && (
            <nav className={styles.links} aria-label="Design system preview">
              <Link className={styles.link} href="/__gallery">
                Open the UI gallery
              </Link>
              <Link className={styles.link} href="/__gallery/quiz-single">
                Single-select question
              </Link>
              <Link className={styles.link} href="/__gallery/quiz-multi">
                Multi-select question
              </Link>
            </nav>
          )}
        </main>
      </Card>
    </PageShell>
  )
}
