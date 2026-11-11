import { useId } from 'react'
import type { ReactNode } from 'react'

/**
 * Illustrations of the plan sheet, drawn for Bloom (guardrail 6: nothing is cropped from the
 * reference images). Abstract figures with no face of a real person. TODO(content): replace with
 * Bloom's final artwork.
 */

const SKIN = '#f1c6a6'
const HAIR = '#2a2340'

/** The two figures of "NOW" and "YOUR GOAL": slumped and tired against upright and calm. */
export function SheetAvatar({ tone }: { tone: 'now' | 'goal' }) {
  const clip = useId()
  const now = tone === 'now'
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <clipPath id={clip}>
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect
          width="100"
          height="100"
          fill={now ? 'var(--now-avatar-bg)' : 'var(--goal-avatar-bg)'}
        />
        <path
          d={now ? 'M2 104c3-22 20-32 48-32s44 10 48 32Z' : 'M4 104c2-24 18-34 46-34s42 10 46 34Z'}
          fill={now ? '#6a5fc2' : '#4a8f86'}
        />
        <rect x="42" y="58" width="16" height="18" rx="6" fill={SKIN} />
        <g transform={now ? 'rotate(-7 50 62)' : undefined}>
          <ellipse cx="50" cy="42" rx="21" ry="24" fill={SKIN} />
          <path d="M28 40c-2-17 9-27 22-27s24 10 22 27c-4-8-10-12-22-12s-18 4-22 12Z" fill={HAIR} />
          {now ? (
            <>
              <path
                d="M38 44q3.500 2.500 7 0M55 44q3.500 2.500 7 0"
                fill="none"
                stroke={HAIR}
                strokeWidth="1.800"
                strokeLinecap="round"
              />
              <path
                d="M43 55q7-3.500 14 0"
                fill="none"
                stroke="#a15c52"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <circle cx="42" cy="43" r="2.200" fill={HAIR} />
              <circle cx="58" cy="43" r="2.200" fill={HAIR} />
              <path
                d="M42 52q8 7 16 0"
                fill="none"
                stroke="#a15c52"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      </g>
    </svg>
  )
}

/** A generic, faceless reviewer: the photo of the reference is not reproduced. */
export function ReviewerAvatar() {
  const clip = useId()
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <clipPath id={clip}>
        <circle cx="32" cy="32" r="32" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill="#ffe3c2" />
        <path d="M4 68c2-18 12-24 28-24s26 6 28 24Z" fill="#ffa032" />
        <circle cx="32" cy="27" r="10.500" fill={SKIN} />
        <path d="M21 26c-1-9 5-14 11-14s12 5 11 14c-3-4-6-6-11-6s-8 2-11 6Z" fill={HAIR} />
      </g>
    </svg>
  )
}

const GLYPHS: Readonly<Record<string, ReactNode>> = {
  habits: (
    <path
      d="M7 17c0-6 4-10 11-10 0 7-4 11-10 11M7 17c1-3 3-5 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.800"
      strokeLinecap="round"
    />
  ),
  wellbeing: (
    <path
      d="M12 18.500s-6.500-3.800-6.500-8.200A3.500 3.500 0 0 1 12 8.500a3.500 3.500 0 0 1 6.500 1.800c0 4.400-6.500 8.200-6.500 8.200Z"
      fill="currentColor"
    />
  ),
  coaching: (
    <path
      d="M5 13a7 7 0 0 1 14 0M5 13v3.500h2.500V13H5Zm14 0v3.500h-2.500V13H19ZM16.500 17.500c0 1.500-1.500 2.500-4 2.500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.800"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  tools: (
    <path
      d="M12 5c1.500 2.500 1.500 5 0 7.500C10.500 10 10.500 7.500 12 5Zm-6 5c3 .5 5 2 6 4.500-3-.5-5-2-6-4.500Zm12 0c-1 2.500-3 4-6 4.500 1-2.500 3-4 6-4.500ZM8 18.500h8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.600"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  planners: (
    <path
      d="M7 5.500h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Zm2 4h6M9 12.500h6M9 15.500h3.500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.700"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  desktop: (
    <path
      d="M5 6.500h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm4 12h6M12 16.500v2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.700"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

const TINTS: Readonly<Record<string, readonly [string, string]>> = {
  habits: ['#e3f6ea', '#2f8f57'],
  wellbeing: ['#ffe4ea', '#d6204f'],
  coaching: ['#e8e4fd', '#5043b2'],
  tools: ['#e1f0fe', '#1f6fb8'],
  planners: ['#fff0d4', '#b36a00'],
  desktop: ['#e6ecf2', '#3d5266'],
}

/** A pastel circle with a simple glyph, in place of the 3D illustrations of the reference. */
export function BenefitIcon({ id }: { id: string }) {
  const [bg, fg] = TINTS[id] ?? TINTS.habits
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ color: fg }}>
      <circle cx="12" cy="12" r="12" fill={bg} />
      <g transform="translate(2.400 2.400) scale(0.8)">{GLYPHS[id] ?? GLYPHS.habits}</g>
    </svg>
  )
}

/** The picture of "future you" above the letter: a sunset and two people sitting on a pier. */
export function SunsetScene() {
  const sky = useId()
  return (
    <svg
      viewBox="0 0 320 150"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b4fd6" />
          <stop offset="0.45" stopColor="#d96aa8" />
          <stop offset="0.8" stopColor="#ffb26b" />
          <stop offset="1" stopColor="#ffd9a0" />
        </linearGradient>
      </defs>
      <rect width="320" height="150" fill={`url(#${sky})`} />
      <circle cx="176" cy="96" r="30" fill="#fff0c9" opacity="0.9" />
      <g fill="#fff" opacity="0.5">
        <rect x="40" y="26" width="46" height="5" rx="2.500" />
        <rect x="210" y="40" width="60" height="5" rx="2.500" />
        <rect x="120" y="18" width="34" height="4" rx="2" />
      </g>
      <path d="M0 112c40-8 80-8 120 0s80 8 120 0 60-6 80-2v40H0Z" fill="#7a4fa8" opacity="0.55" />
      <rect x="0" y="118" width="320" height="32" fill="#3a2a6b" />
      <g fill="#1d1536">
        <circle cx="158" cy="98" r="6" />
        <circle cx="176" cy="97" r="6" />
        <path d="M150 124c0-12 4-20 8-20s8 8 8 20Z" />
        <path d="M168 124c0-12 4-20 8-20s8 8 8 20Z" />
      </g>
    </svg>
  )
}

/**
 * A gift box: lid, body, ribbon and bow. `open` lifts the lid and lets the light out; `dim` fades
 * the boxes that were not picked.
 */
export function GiftBox({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <g transform={open ? 'translate(0 -10) rotate(-6 48 34)' : undefined}>
        <rect x="8" y="22" width="80" height="20" rx="7" fill="var(--gift-lid)" />
        <rect x="42" y="22" width="12" height="20" fill="var(--gift-ribbon)" />
        <path
          d="M48 22c-8-14-20-10-16-3 3 5 12 4 16 3Zm0 0c8-14 20-10 16-3-3 5-12 4-16 3Z"
          fill="var(--gift-ribbon)"
        />
      </g>
      <rect x="14" y="44" width="68" height="46" rx="8" fill="var(--gift-body)" />
      <rect x="42" y="44" width="12" height="46" fill="var(--gift-ribbon)" />
    </svg>
  )
}
