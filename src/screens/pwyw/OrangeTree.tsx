/**
 * Orange tree for the corners of "pay what you want" (PLAN-B 4.1, items 8 and 9): a leafy canopy
 * with fruit, cut off by the bottom edge of the page. Bloom's own drawing (guardrail 6: nothing is
 * cropped from the reference). TODO(content): replace with the final illustration.
 */
const FRUIT: ReadonlyArray<readonly [number, number]> = [
  [54, 118],
  [92, 96],
  [128, 132],
  [168, 100],
  [206, 128],
  [76, 150],
  [150, 156],
  [232, 104],
]

export function OrangeTree({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 280 190"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M128 190 C132 160 136 142 146 120 L158 122 C152 148 152 166 156 190 Z"
        fill="var(--pwyw-tree-trunk)"
      />
      <g fill="var(--pwyw-tree-leaf)">
        <circle cx="70" cy="118" r="44" />
        <circle cx="132" cy="84" r="54" />
        <circle cx="200" cy="112" r="48" />
        <circle cx="244" cy="136" r="32" />
        <circle cx="38" cy="150" r="30" />
      </g>
      <g fill="#8fc46a" opacity="0.85">
        <circle cx="96" cy="96" r="26" />
        <circle cx="156" cy="70" r="30" />
        <circle cx="214" cy="104" r="22" />
        <circle cx="120" cy="124" r="24" />
      </g>
      <g fill="#d9d85a" opacity="0.7">
        <circle cx="134" cy="58" r="16" />
        <circle cx="84" cy="88" r="12" />
        <circle cx="196" cy="86" r="14" />
      </g>
      <g fill="var(--pwyw-tree-orange)">
        {FRUIT.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="8" />
        ))}
      </g>
    </svg>
  )
}
