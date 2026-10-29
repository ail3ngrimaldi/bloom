import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isDevToolsEnabled } from '@/lib/env'
import { QuizSingleDemo } from '../QuizSingleDemo'

export const metadata: Metadata = { title: 'Gallery: single-select question' }

export default function QuizSinglePage() {
  if (!isDevToolsEnabled()) notFound()
  return <QuizSingleDemo />
}
