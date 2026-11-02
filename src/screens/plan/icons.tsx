import type { SVGProps } from 'react'

/**
 * Icons of the plan sheet, drawn for Bloom (guardrail 6: nothing is cropped from the reference
 * images). They are decorative: the text next to each one says what it means, so every icon is
 * hidden from assistive technology.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  )
}

export function FlameIcon({ on = true, ...rest }: IconProps & { on?: boolean }) {
  return (
    <Icon {...rest}>
      <path
        d="M12.4 2.5c.4 3-1.3 4.4-2.7 6C8.3 10 7 11.600 7 14.200 7 17.500 9.200 20 12 20s5-2.500 5-5.600c0-1.800-.8-3.200-1.600-4.200-.3 1-.9 1.800-1.700 2.100.5-3.600-.4-6.800-1.300-9.800Z"
        fill={on ? 'var(--flame)' : 'var(--flame-off)'}
      />
      {on && (
        <path
          d="M12 20c-1.600 0-2.800-1.300-2.800-3 0-1.400 1-2.200 2-3.200.3 1.100 1.300 1.500 1.700 2.400.4.800.1 2.200-.9 3.800Z"
          fill="#ffe08a"
        />
      )}
    </Icon>
  )
}

export function BrainIcon(props: IconProps) {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.500 4.500a3 3 0 0 0-3 3 3 3 0 0 0-1.500 5.200 3 3 0 0 0 2 4.800 3 3 0 0 0 5-1V5.500a2.500 2.500 0 0 0-2.500-1Z" />
      <path d="M14.500 4.500a3 3 0 0 1 3 3 3 3 0 0 1 1.500 5.200 3 3 0 0 1-2 4.800 3 3 0 0 1-5-1V5.500a2.500 2.500 0 0 1 2.500-1Z" />
      <path d="M9 10h1.500M13.500 14H15M9 14.500h1" />
    </Icon>
  )
}

export function TargetIcon(props: IconProps) {
  return (
    <Icon fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.200" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M16.500 7.500 21 3M17.800 3.200 21 3l-.2 3.200" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeWidth="2.600"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5.500 12.500 10 17l8.500-9.500" />
    </Icon>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" {...props}>
      <path d="M20.500 3.500 3.500 10.800c-.8.300-.8 1.400 0 1.700l4.700 1.700 1.800 5.300c.3.800 1.300.9 1.800.2l2.300-3 4.100 3c.7.500 1.600.1 1.800-.7l2.500-14.500c.2-1-.8-1.700-1.600-1.400-.1 0-.2 0-.4 0Z" />
    </Icon>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" {...props}>
      <path d="M12 3a6 6 0 0 0-6 6v3.600c0 .7-.3 1.300-.8 1.800L4 15.700c-.6.600-.2 1.700.7 1.700h14.600c.9 0 1.300-1.100.7-1.700l-1.200-1.300a2.500 2.500 0 0 1-.8-1.800V9a6 6 0 0 0-6-6Z" />
      <path d="M9.500 19a2.500 2.500 0 0 0 5 0Z" />
    </Icon>
  )
}

export function DottedCircleIcon(props: IconProps) {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="0.1 3.800"
      {...props}
    >
      <circle cx="12" cy="12" r="8.500" />
    </Icon>
  )
}

/** The blue seal with a percent sign of the promo code. */
export function PercentSealIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        fill="#2a4fd6"
        d="m12 1.500 2.300 1.700 2.900-.2 1 2.700 2.500 1.500-.8 2.800 1.100 2.600-2.200 1.900-.6 2.900-2.900.4L12 22.500l-2.300-1.700-2.900.2-1-2.700-2.500-1.500.8-2.800L2.900 11.400l2.200-1.900.6-2.900 2.900-.4L12 1.500Z"
      />
      <path d="M8.800 15.200l6.400-6.400" stroke="#fff" strokeWidth="1.800" strokeLinecap="round" />
      <circle cx="9" cy="9.200" r="1.400" fill="#fff" />
      <circle cx="15" cy="14.800" r="1.400" fill="#fff" />
    </Icon>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinejoin="round" {...props}>
      <path d="M12 3 5 5.800v5.300c0 4.400 3 7.800 7 9.400 4-1.600 7-5 7-9.400V5.800L12 3Z" />
      <path d="m9 12 2.200 2.200L15.200 10" strokeLinecap="round" />
    </Icon>
  )
}

export function CardIcon(props: IconProps) {
  return (
    <Icon fill="none" stroke="currentColor" strokeWidth="1.600" strokeLinecap="round" {...props}>
      <rect x="2.500" y="5.500" width="19" height="13" rx="2.200" />
      <path d="M2.500 10h19M6 15h4" />
    </Icon>
  )
}

export function HelpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .8-1 1.700M12 16.500v.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  )
}

/** A seal in the current colour with a check in `check` (white by default). */
export function VerifiedSeal({ check = '#fff', ...props }: IconProps & { check?: string }) {
  return (
    <Icon {...props}>
      <path
        fill="currentColor"
        d="m12 1.800 2.200 1.600 2.700-.1 1 2.500 2.300 1.400-.7 2.700 1 2.500-2 1.800-.5 2.700-2.700.4L12 21.800l-2.200-1.600-2.700.1-1-2.500-2.300-1.400.7-2.700-1-2.500 2-1.800.5-2.700 2.700-.4L12 1.800Z"
      />
      <path
        d="m8.300 12.200 2.400 2.400 4.800-5"
        fill="none"
        stroke={check}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" {...props}>
      <path d="m12 2.800 2.800 5.800 6.300.9-4.600 4.400 1.100 6.300L12 17.200l-5.600 3 1.100-6.300L2.900 9.500l6.300-.9L12 2.800Z" />
    </Icon>
  )
}

/** Five stars, all filled (every review and testimonial of the reference is 5 out of 5). */
export function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={className} role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, index) => (
        <StarIcon key={index} />
      ))}
    </span>
  )
}

/** Generic award marks (not the logos of the stores that gave the awards). */
export function AwardIcon({ kind, ...rest }: IconProps & { kind: 'play' | 'store' | 'design' }) {
  return (
    <Icon {...rest}>
      <circle cx="12" cy="12" r="12" fill="var(--expert-accent)" />
      {kind === 'play' && <path d="M9 6.500v11l9-5.500-9-5.500Z" fill="#fff" />}
      {kind === 'store' && (
        <path
          d="M12 6.500 14 11l-1.200.6M12 6.500 10 11M7.500 15.500h9M9.200 11.800l2 3.700m3.700-3.700-2 3.700"
          fill="none"
          stroke="#fff"
          strokeWidth="1.800"
          strokeLinecap="round"
        />
      )}
      {kind === 'design' && (
        <path
          d="M12 6.800 13.400 10.400l3.800.3-2.900 2.500.9 3.700L12 14.900 8.800 16.900l.9-3.700-2.900-2.500 3.800-.3L12 6.800Z"
          fill="#fff"
        />
      )}
    </Icon>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}
