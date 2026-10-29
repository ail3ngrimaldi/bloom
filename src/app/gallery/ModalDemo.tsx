'use client'

import { useState } from 'react'
import { Button, Modal } from '@/ui'
import type { ModalSize } from '@/ui'
import styles from './gallery.module.css'

export function ModalDemo() {
  const [open, setOpen] = useState<ModalSize | null>(null)
  const close = () => setOpen(null)
  return (
    <div className={styles.row}>
      <button type="button" className={styles.demoButton} onClick={() => setOpen('sheet')}>
        Open sheet modal (loader question)
      </button>
      <button type="button" className={styles.demoButton} onClick={() => setOpen('checkout')}>
        Open checkout modal
      </button>
      <Modal
        open={open === 'sheet'}
        onClose={close}
        size="sheet"
        title="Do you tend to lose motivation easily?"
      >
        <div className={styles.modalBody}>
          <p>
            Sheet: 375 x 648, radius 32, backdrop rgba(0,0,0,.5). ESC or a backdrop click closes it.
          </p>
          <Button onClick={close}>Close</Button>
        </div>
      </Modal>
      <Modal open={open === 'checkout'} onClose={close} size="checkout" title="Checkout modal">
        <div className={styles.modalBody}>
          <p>Checkout: max 430 x 630 with internal scroll, backdrop rgba(0,0,0,.6).</p>
          {Array.from({ length: 14 }, (_, index) => (
            <p key={index}>Scrollable line {index + 1}</p>
          ))}
          <Button onClick={close}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
