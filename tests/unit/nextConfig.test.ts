import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isDevToolsEnabled, isGalleryEnabled } from '@/lib/env'

const KEYS = [
  'VERCEL_ENV',
  'NEXT_PUBLIC_VERCEL_ENV',
  'NEXT_PUBLIC_ENABLE_DEV_TOOLS',
  'NEXT_PUBLIC_SHOW_GALLERY',
] as const

/** Evaluates next.config.ts afresh with exactly these variables set (an absent key is unset). */
async function configEnv(vars: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key]
  Object.assign(process.env, vars)
  vi.resetModules()
  const { default: config } = await import('../../next.config')
  return config.env as Record<string, string>
}

describe('next.config switches', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of KEYS) saved[key] = process.env[key]
  })

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
    vi.unstubAllEnvs()
  })

  it('leaves everything off for a build outside Vercel', async () => {
    expect(await configEnv({})).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: '',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '',
      NEXT_PUBLIC_SHOW_GALLERY: '',
    })
  })

  it('turns the dev tools and the gallery on for a Vercel preview, with no dashboard setting', async () => {
    expect(await configEnv({ VERCEL_ENV: 'preview' })).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: 'preview',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1',
      NEXT_PUBLIC_SHOW_GALLERY: '1',
    })
  })

  it('turns only the gallery on for Vercel production (pre-launch)', async () => {
    expect(await configEnv({ VERCEL_ENV: 'production' })).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: 'production',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '',
      NEXT_PUBLIC_SHOW_GALLERY: '1',
    })
  })

  it('lets NEXT_PUBLIC_SHOW_GALLERY=0 hide the gallery again (launch)', async () => {
    const env = await configEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SHOW_GALLERY: '0' })
    expect(env.NEXT_PUBLIC_SHOW_GALLERY).toBe('0')
  })

  it('lets NEXT_PUBLIC_ENABLE_DEV_TOOLS=0 hide the dev tools on a preview', async () => {
    const env = await configEnv({ VERCEL_ENV: 'preview', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '0' })
    expect(env.NEXT_PUBLIC_ENABLE_DEV_TOOLS).toBe('0')
  })

  it('prefers an explicitly exposed NEXT_PUBLIC_VERCEL_ENV over VERCEL_ENV', async () => {
    const env = await configEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_VERCEL_ENV: 'preview' })
    expect(env.NEXT_PUBLIC_VERCEL_ENV).toBe('preview')
  })

  it.each([
    [{}, { gallery: false, devTools: false }],
    [{ VERCEL_ENV: 'preview' }, { gallery: true, devTools: true }],
    [
      { VERCEL_ENV: 'preview', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '0' },
      { gallery: true, devTools: false },
    ],
    [{ VERCEL_ENV: 'production' }, { gallery: true, devTools: false }],
    [
      { VERCEL_ENV: 'production', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1' },
      { gallery: true, devTools: false },
    ],
    [
      { VERCEL_ENV: 'production', NEXT_PUBLIC_SHOW_GALLERY: '0' },
      { gallery: false, devTools: false },
    ],
  ])('a production build with %j ends up with %j', async (vars, expected) => {
    const env = await configEnv(vars)
    vi.stubEnv('NODE_ENV', 'production')
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value)
    expect({ gallery: isGalleryEnabled(), devTools: isDevToolsEnabled() }).toEqual(expected)
  })
})
