import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './legal.module.css'

/**
 * Placeholders for the legal pages the funnel links to (decision D8). TODO(content): the real
 * Terms, Privacy Policy and Subscription Policy must be written and reviewed before launch.
 */
const DOCS = {
  privacy: 'Privacy Policy',
  terms: 'Terms and Conditions',
  subscription: 'Subscription Policy',
} as const

type Doc = keyof typeof DOCS

function isDoc(value: string): value is Doc {
  return value in DOCS
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }))
}

export async function generateMetadata({ params }: PageProps<'/legal/[doc]'>): Promise<Metadata> {
  const { doc } = await params
  return { title: isDoc(doc) ? `${DOCS[doc]} | Bloom` : 'Bloom' }
}

export default async function LegalPage({ params }: PageProps<'/legal/[doc]'>) {
  const { doc } = await params
  if (!isDoc(doc)) notFound()
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{DOCS[doc]}</h1>
      <p className={styles.text}>
        Bloom is not launched yet and this page is a placeholder: the final {DOCS[doc]} will be
        published here before launch.
      </p>
      <p className={styles.text}>
        Meanwhile, the answers you give in the quiz stay in this browser tab (session storage) and
        are not sent anywhere, and no payment can be taken.
      </p>
      <Link className={styles.link} href="/s/intro">
        Back to Bloom
      </Link>
    </main>
  )
}
