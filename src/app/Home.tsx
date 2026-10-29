import { Link } from 'react-router-dom'
import { Card, Header, PageShell } from '@/ui'
import styles from './Home.module.css'

/** Placeholder landing: phase 2a replaces it with the funnel entry. */
export function Home() {
  return (
    <PageShell theme="lilac">
      <Card>
        <Header />
        <main className={styles.main}>
          <h1 className={styles.title}>Bloom</h1>
          <p className={styles.text}>The onboarding funnel is being built.</p>
          {import.meta.env.DEV && (
            <Link className={styles.link} to="/__gallery">
              Open the UI gallery
            </Link>
          )}
        </main>
      </Card>
    </PageShell>
  )
}
