import Link from 'next/link'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

/**
 * Renders a legal template: `{{name}}` placeholders become the given nodes (amounts in bold,
 * links to the legal pages), the rest stays plain text.
 */
export function LegalText({
  template,
  values,
  className,
}: {
  template: string
  values: Record<string, ReactNode>
  className?: string
}) {
  const parts = template.split(/(\{\{\w+\}\})/g)
  return (
    <p className={className}>
      {parts.map((part, index) => {
        const name = /^\{\{(\w+)\}\}$/.exec(part)?.[1]
        return <Fragment key={index}>{name && name in values ? values[name] : part}</Fragment>
      })}
    </p>
  )
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} target="_blank" rel="noopener">
      {children}
    </Link>
  )
}
