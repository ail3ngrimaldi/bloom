import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isGalleryEnabled } from '@/lib/env'
import { QuizSingleDemo } from '../QuizSingleDemo'

export const metadata: Metadata = { title: 'Gallery: single-select question' }

export default function QuizSinglePage() {
  if (!isGalleryEnabled()) notFound()
  return <QuizSingleDemo />
}
