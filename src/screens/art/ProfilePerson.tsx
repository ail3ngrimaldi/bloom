import { useId } from 'react'
import type { Audience } from '@/funnel/personalize'
import styles from './art.module.css'

/**
 * A tired person, hand on chest, for the wellbeing summary (PLAN 5.7 item 3); the hair follows the
 * audience, as the reference's illustration followed the gender. TODO(content): placeholder art.
 */
export function ProfilePerson({ audience }: { audience: Audience }) {
  const id = useId()
  return (
    <svg className={styles.illustration} viewBox="0 0 205 216" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#e4e1fd" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6cff" />
          <stop offset="1" stopColor="#4b3bd6" />
        </linearGradient>
      </defs>
      <circle cx="102" cy="100" r="100" fill={`url(#${id}-glow)`} />
      {/* Long hair behind the shoulders for "women". */}
      {audience === 'women' && (
        <path d="M60 86 C58 140 70 168 80 176 L124 176 C134 168 146 140 144 86 Z" fill="#3b2a26" />
      )}
      <path
        d="M28 216 C30 168 58 150 102 150 C146 150 174 168 176 216 Z"
        fill={`url(#${id}-top)`}
      />
      <path d="M90 128 L90 152 C96 158 108 158 114 152 L114 128 Z" fill="#e8b48c" />
      <ellipse cx="102" cy="100" rx="34" ry="38" fill="#f1c6a6" />
      {audience === 'men' && (
        <path
          d="M68 96 C66 66 86 56 104 58 C124 58 140 70 136 96 C130 82 118 76 102 78 C86 78 74 84 68 96 Z"
          fill="#2a2340"
        />
      )}
      {audience === 'women' && (
        <path
          d="M66 100 C62 64 86 54 104 56 C124 56 144 70 138 102 C132 84 116 74 100 76 C84 78 72 86 66 100 Z"
          fill="#3b2a26"
        />
      )}
      {audience === 'people' && (
        <path
          d="M67 98 C64 64 86 55 104 56 C125 57 142 70 137 98 C128 86 114 80 100 84 C86 80 74 86 67 98 Z"
          fill="#6b4430"
        />
      )}
      {/* Closed eyes: tired, not a portrait. */}
      <g fill="none" stroke="#5c3b2e" strokeWidth="2.4" strokeLinecap="round">
        <path d="M84 104 q6 5 12 0" />
        <path d="M108 104 q6 5 12 0" />
      </g>
      {/* Hand resting on the chest. */}
      <path
        d="M86 186 C84 172 94 164 106 166 L126 170 C132 172 132 180 126 182 L110 184 C104 192 94 196 86 186 Z"
        fill="#e8b48c"
      />
      {/* Worry marks. */}
      <g fill="none" stroke="#9a5bbe" strokeWidth="2.4" strokeLinecap="round">
        <path d="M150 62 l8 -8" />
        <path d="M156 76 l11 -3" />
        <path d="M140 52 l2 -11" />
      </g>
    </svg>
  )
}
