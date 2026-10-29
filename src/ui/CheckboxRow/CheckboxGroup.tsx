import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import styles from './CheckboxGroup.module.css'

export type CheckboxGroupProps = HTMLAttributes<HTMLDivElement>

/** role="group" stack of CheckboxRows with the 9px row gap. Name it with aria-labelledby. */
export function CheckboxGroup({ className, ...rest }: CheckboxGroupProps) {
  return <div {...rest} role="group" className={cx(styles.group, className)} />
}
