import { Fragment } from 'react'
import type { ReactNode } from 'react'

/**
 * Fills a text with `{{name}}` placeholders where some values are nodes (a bold amount, a link),
 * which interpolate() cannot do. Names without a value stay visible, so a gap shows up in QA.
 */
export function fillTemplate(template: string, values: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\{\w+\}\})/g).map((part, index) => {
    const name = /^\{\{(\w+)\}\}$/.exec(part)?.[1]
    return <Fragment key={index}>{name && name in values ? values[name] : part}</Fragment>
  })
}
