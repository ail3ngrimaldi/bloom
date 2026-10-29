import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isDevToolsEnabled } from '@/lib/env'
import { QuizMultiDemo } from '../QuizMultiDemo'

export const metadata: Metadata = { title: 'Gallery: multi-select question' }

export default function QuizMultiPage() {
  if (!isDevToolsEnabled()) notFound()
  return <QuizMultiDemo />
}
