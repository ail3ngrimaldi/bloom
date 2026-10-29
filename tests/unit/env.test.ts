import { afterEach, describe, expect, it, vi } from 'vitest'
import { isDevToolsEnabled, isGalleryEnabled } from '@/lib/env'

function stub(env: Record<string, string | undefined>) {
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(name, '')
    else vi.stubEnv(name, value)
  }
}

describe('isDevToolsEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is on outside production (next dev, tests)', () => {
    stub({ NODE_ENV: 'development' })
    expect(isDevToolsEnabled()).toBe(true)
    stub({ NODE_ENV: 'test' })
    expect(isDevToolsEnabled()).toBe(true)
  })

  it('is off in a production build by default', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_VERCEL_ENV: '', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '' })
    expect(isDevToolsEnabled()).toBe(false)
  })

  it('needs the opt-in switch on a Vercel preview deployment', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_VERCEL_ENV: 'preview' })
    stub({ NEXT_PUBLIC_ENABLE_DEV_TOOLS: '' })
    expect(isDevToolsEnabled()).toBe(false)
    stub({ NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1' })
    expect(isDevToolsEnabled()).toBe(true)
  })

  it('only accepts the exact value 1 for the switch', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_VERCEL_ENV: 'preview' })
    for (const value of ['0', 'true', 'yes', ' 1']) {
      stub({ NEXT_PUBLIC_ENABLE_DEV_TOOLS: value })
      expect(isDevToolsEnabled(), value).toBe(false)
    }
  })

  it('never enables the tools on the production or development Vercel environments', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1' })
    for (const vercelEnv of ['production', 'development', '']) {
      stub({ NEXT_PUBLIC_VERCEL_ENV: vercelEnv })
      expect(isDevToolsEnabled(), vercelEnv).toBe(false)
    }
  })
})

describe('isGalleryEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is on outside production (next dev, tests)', () => {
    stub({ NODE_ENV: 'development' })
    expect(isGalleryEnabled()).toBe(true)
    stub({ NODE_ENV: 'test' })
    expect(isGalleryEnabled()).toBe(true)
  })

  it('is off in a production build without the switch', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_SHOW_GALLERY: '' })
    expect(isGalleryEnabled()).toBe(false)
  })

  it('is on in a production build with NEXT_PUBLIC_SHOW_GALLERY=1, whatever the Vercel environment', () => {
    stub({ NODE_ENV: 'production', NEXT_PUBLIC_SHOW_GALLERY: '1' })
    for (const vercelEnv of ['production', 'preview', 'development', '']) {
      stub({ NEXT_PUBLIC_VERCEL_ENV: vercelEnv })
      expect(isGalleryEnabled(), vercelEnv).toBe(true)
    }
  })

  it('only accepts the exact value 1', () => {
    stub({ NODE_ENV: 'production' })
    for (const value of ['0', 'true', 'yes', ' 1']) {
      stub({ NEXT_PUBLIC_SHOW_GALLERY: value })
      expect(isGalleryEnabled(), value).toBe(false)
    }
  })

  it('does not follow the dev-tools switch: the QA tooling stays closed on production', () => {
    stub({
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_ENV: 'production',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: '1',
      NEXT_PUBLIC_SHOW_GALLERY: '1',
    })
    expect(isGalleryEnabled()).toBe(true)
    expect(isDevToolsEnabled()).toBe(false)
  })
})
