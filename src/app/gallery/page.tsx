import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isGalleryEnabled } from '@/lib/env'
import { Gallery } from './Gallery'

export const metadata: Metadata = { title: 'Bloom UI gallery' }

/** Reached as /__gallery (see the rewrite in next.config.ts). 404 unless dev tools are enabled. */
export default function GalleryPage() {
  if (!isGalleryEnabled()) notFound()
  return <Gallery />
}
