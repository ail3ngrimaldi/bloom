import { notFound } from 'next/navigation'
import { FunnelView } from '@/funnel/FunnelView'
import { STEP_IDS, isStepId } from '@/funnel/steps'

// Every step URL is prerendered; any other /s/<id> is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return STEP_IDS.map((stepId) => ({ stepId }))
}

/**
 * /s/<stepId>. The page only validates the id: FunnelView reads the step from the URL itself,
 * because moving between steps changes the URL with the History API (no new page request).
 */
export default async function StepPage({ params }: PageProps<'/s/[stepId]'>) {
  const { stepId } = await params
  if (!isStepId(stepId)) notFound()
  return <FunnelView />
}
