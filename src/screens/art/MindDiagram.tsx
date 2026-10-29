import { useId } from 'react'
import styles from './MindDiagram.module.css'

export interface MindDiagramProps {
  /** Chip labels: thoughts, feelings and behaviour. */
  labels: { thoughts: string; feelings: string; behavior: string }
}

/**
 * The thoughts / feelings / behaviour cycle inside a white circle and a dotted ring, with a chip
 * per element (PLAN 5.6 #31 item 1, redrawn without the reference's brain). TODO(content):
 * placeholder art, replace with Bloom's own illustration.
 */
export function MindDiagram({ labels }: MindDiagramProps) {
  const id = useId()
  return (
    <div className={styles.diagram}>
      <svg viewBox="0 0 277 261" aria-hidden="true" focusable="false">
        <defs>
          <marker
            id={`${id}-arrow`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3424b8" />
          </marker>
        </defs>
        <circle
          cx="138.5"
          cy="130.5"
          r="126"
          fill="none"
          stroke="#c9c5e8"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <circle cx="138.5" cy="130.5" r="100" fill="#ffffff" />
        <g
          fill="none"
          stroke="#3424b8"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd={`url(#${id}-arrow)`}
        >
          <path d="M 122 98 Q 138 78 158 92" />
          <path d="M 178 128 Q 180 156 158 168" />
          <path d="M 118 168 Q 96 158 98 130" />
        </g>
        <circle cx="104" cy="112" r="20" fill="#6454fe" />
        <circle cx="176" cy="106" r="20" fill="#e99282" />
        <circle cx="138" cy="170" r="20" fill="#35ba9c" />
        <g fill="#ffffff">
          <circle cx="98" cy="110" r="3" />
          <circle cx="106" cy="114" r="3" />
          <circle cx="111" cy="108" r="2" />
          <path d="M 176 115 l -8 -8 a 4.5 4.5 0 0 1 8 -5 a 4.5 4.5 0 0 1 8 5 z" />
          <path
            d="M 131 172 l 5 5 l 9 -11"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <span className={`${styles.chip} ${styles.thoughts}`}>{labels.thoughts}</span>
      <span className={`${styles.chip} ${styles.feelings}`}>{labels.feelings}</span>
      <span className={`${styles.chip} ${styles.behavior}`}>{labels.behavior}</span>
    </div>
  )
}
