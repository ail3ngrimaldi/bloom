/// <reference types="node" />
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MUSIC_URL, TAP_URL } from '@/services/sound/files'
import { ROOT, filesUnder } from './helpers/repo'

/**
 * The two sounds of the funnel (src/services/sound/files.ts) are real MP3 files in public/audio,
 * small enough for a phone on mobile data, and nothing else (a stray .mpeg, a recording) is
 * deployed next to them.
 */
const fileOf = (url: string) => join(ROOT, 'public', url)
const header = (url: string) => readFileSync(fileOf(url)).subarray(0, 3)

/** An MP3 starts with an ID3 tag or straight with a frame (11 bits of sync). */
const isMp3 = (bytes: Buffer) =>
  bytes.toString('latin1') === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)

describe('the funnel sounds', () => {
  it.each([
    ['the music', MUSIC_URL],
    ['the click', TAP_URL],
  ])('%s is an MP3 under public/audio', (_name, url) => {
    expect(url).toMatch(/^\/audio\/[a-z-]+\.mp3$/)
    expect(existsSync(fileOf(url))).toBe(true)
    expect(isMp3(header(url) as Buffer)).toBe(true)
  })

  it('keeps the music under 3 MB and the click under 100 KB', () => {
    expect(statSync(fileOf(MUSIC_URL)).size).toBeLessThan(3 * 1024 * 1024)
    expect(statSync(fileOf(TAP_URL)).size).toBeLessThan(100 * 1024)
  })

  it('has no other file in public/audio, so nothing unused is deployed', () => {
    expect(filesUnder('public/audio').sort()).toEqual(
      [MUSIC_URL, TAP_URL].map((url) => `public${url}`).sort(),
    )
  })
})
