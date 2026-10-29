import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isDevToolsEnabled } from '@/lib/env'

const KEYS = ['VERCEL_ENV', 'NEXT_PUBLIC_VERCEL_ENV', 'NEXT_PUBLIC_ENABLE_DEV_TOOLS'] as const

/** Evaluates next.config.ts afresh with exactly these variables set (an absent key is unset). */
async function configEnv(vars: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key]
  Object.assign(process.env, vars)
  vi.resetModules()
  const { default: config } = await import('../../next.config')
  return config.env as Record<string, string>
}

describe('next.config dev-tools defaults', () => {
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

  it('leaves the tools off for a build outside Vercel', async () => {
    expect(await configEnv({})).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: '',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '',
    })
  })

  it('turns them on by default for a Vercel preview, without any dashboard setting', async () => {
    expect(await configEnv({ VERCEL_ENV: 'preview' })).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: 'preview',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1',
    })
  })

  it('does not turn them on for the Vercel production environment', async () => {
    expect(await configEnv({ VERCEL_ENV: 'production' })).toEqual({
      NEXT_PUBLIC_VERCEL_ENV: 'production',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '',
    })
  })

  it('lets NEXT_PUBLIC_ENABLE_DEV_TOOLS=0 hide them again on a preview', async () => {
    const env = await configEnv({ VERCEL_ENV: 'preview', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '0' })
    expect(env.NEXT_PUBLIC_ENABLE_DEV_TOOLS).toBe('0')
  })

  it('prefers an explicitly exposed NEXT_PUBLIC_VERCEL_ENV over VERCEL_ENV', async () => {
    const env = await configEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_VERCEL_ENV: 'preview' })
    expect(env.NEXT_PUBLIC_VERCEL_ENV).toBe('preview')
  })

  it.each([
    [{ VERCEL_ENV: 'preview' }, true],
    [{ VERCEL_ENV: 'preview', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '0' }, false],
    [{ VERCEL_ENV: 'production' }, false],
    [{ VERCEL_ENV: 'production', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1' }, false],
    [{}, false],
  ])('a production build with %j ends up with the gallery enabled = %s', async (vars, expected) => {
    const env = await configEnv(vars)
    vi.stubEnv('NODE_ENV', 'production')
    for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value)
    expect(isDevToolsEnabled()).toBe(expected)
  })
})
