import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FIRST_WAKE_MS,
  MUSIC_FADE_IN_S,
  MUSIC_GAIN,
  MUSIC_URL,
  MUTE_FADE_S,
  TAP_GAIN,
  TAP_GRACE_MS,
  TAP_START_S,
  TAP_URL,
} from '@/services/sound/files'
import { MUTED_KEY, createBrowserSound } from '@/services/sound'

/**
 * The browser engine of the funnel's sound (src/services/sound/browser.ts) against fakes of Web
 * Audio, the music element and fetch. What matters is when things happen: nothing before the
 * first tap, the music and the click through one context, the muting, the hidden tab.
 */

class FakeParam {
  value = 0
  cancelScheduledValues = vi.fn()
  setValueAtTime = vi.fn()
  linearRampToValueAtTime = vi.fn()
  setTargetAtTime = vi.fn()
}

class FakeGain {
  gain = new FakeParam()
  connect = vi.fn()
}

class FakeSource {
  buffer: unknown = null
  connect = vi.fn()
  start = vi.fn()
}

class FakeContext {
  static all: FakeContext[] = []
  /** What decodeAudioData resolves with; a test swaps it to hold the decode back. */
  static decode: () => Promise<unknown> = async () => ({ duration: 1.56 })
  state = 'suspended'
  currentTime = 10
  destination = {}
  gains: FakeGain[] = []
  sources: FakeSource[] = []
  private handlers = new Map<string, Array<() => void>>()

  constructor() {
    FakeContext.all.push(this)
  }

  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }

  createMediaElementSource = vi.fn(() => ({ connect: vi.fn() }))

  createBufferSource() {
    const source = new FakeSource()
    this.sources.push(source)
    return source
  }

  decodeAudioData = vi.fn(() => FakeContext.decode())

  resume = vi.fn(async () => {
    this.state = 'running'
    this.emit('statechange')
  })

  suspend = vi.fn(async () => {
    this.state = 'suspended'
    this.emit('statechange')
  })

  close = vi.fn(async () => {})

  addEventListener(type: string, handler: () => void) {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler])
  }

  private emit(type: string) {
    for (const handler of this.handlers.get(type) ?? []) handler()
  }
}

/** The browser's autoplay policy: while true the music element refuses to play. */
let refusePlay = false

class FakeAudio {
  static all: FakeAudio[] = []
  loop = false
  preload = ''
  paused = true

  constructor(readonly src: string) {
    FakeAudio.all.push(this)
  }

  play = vi.fn(async () => {
    if (refusePlay) throw new DOMException('Not allowed', 'NotAllowedError')
    this.paused = false
  })

  pause = vi.fn(() => {
    this.paused = true
  })
}

const fetchMock = vi.fn()

/** Every engine a test starts is stopped afterwards: its listeners live on `window`. */
const stoppers: Array<() => void> = []
function create() {
  const sound = createBrowserSound()
  const start = sound.start
  sound.start = () => {
    const stop = start()
    stoppers.push(stop)
    return stop
  }
  return sound
}

/** A tap, a click or a key press anywhere on the page. */
const touch = (type = 'click') => document.body.dispatchEvent(new Event(type, { bubbles: true }))
/** Lets time pass (the audio opens FIRST_WAKE_MS after the first tap) and every promise settle. */
const settle = (ms = FIRST_WAKE_MS) => vi.advanceTimersByTimeAsync(ms)

/** A ready engine: started, the page touched once and every promise settled. */
async function awake() {
  const sound = create()
  const stop = sound.start()
  touch()
  await settle()
  return { sound, stop, ctx: FakeContext.all[0], music: FakeAudio.all[0] }
}

beforeEach(() => {
  vi.useFakeTimers()
  FakeContext.all = []
  FakeContext.decode = async () => ({ duration: 1.56 })
  FakeAudio.all = []
  refusePlay = false
  fetchMock.mockReset()
  fetchMock.mockImplementation(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
  }))
  vi.stubGlobal('AudioContext', FakeContext)
  vi.stubGlobal('Audio', FakeAudio)
  vi.stubGlobal('fetch', fetchMock)
  localStorage.clear()
})

afterEach(() => {
  for (const stop of stoppers.splice(0)) stop()
  Reflect.deleteProperty(document, 'hidden')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('before the first tap', () => {
  it('creates no audio, downloads only the small click and makes no sound', async () => {
    const sound = create()
    sound.start()
    sound.tap()
    await settle()
    expect(FakeContext.all).toHaveLength(0)
    expect(FakeAudio.all).toHaveLength(0)
    expect(fetchMock.mock.calls).toEqual([[TAP_URL]])
  })

  it('does nothing at all until the funnel starts it', async () => {
    const sound = create()
    touch()
    sound.tap()
    await settle()
    expect(FakeContext.all).toHaveLength(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is supported where Web Audio exists', () => {
    expect(create().isSupported()).toBe(true)
  })
})

describe('the first tap', () => {
  it('opens one context inside the tap and plays the music on a loop, fading it in', async () => {
    const { ctx, music } = await awake()
    expect(FakeContext.all).toHaveLength(1)
    expect(music.src).toBe(MUSIC_URL)
    expect(music.loop).toBe(true)
    expect(music.play).toHaveBeenCalledTimes(1)
    expect(ctx.resume).toHaveBeenCalled()
    expect(ctx.createMediaElementSource).toHaveBeenCalledWith(music)
    const [musicGain, tapGain] = ctx.gains
    expect(musicGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      MUSIC_GAIN,
      ctx.currentTime + MUSIC_FADE_IN_S,
    )
    expect(tapGain.gain.value).toBe(TAP_GAIN)
    expect(musicGain.connect).toHaveBeenCalledWith(ctx.destination)
    expect(tapGain.connect).toHaveBeenCalledWith(ctx.destination)
  })

  it('opens the audio once the next step is in, not inside the tap or while the old one leaves', async () => {
    // Opening it takes 100 to 250 ms of the main thread: that would hold back the step the tap
    // leaves and turn the change of its frame into a layout shift.
    const sound = create()
    sound.start()
    touch()
    expect(FakeContext.all).toHaveLength(0)
    await settle(FIRST_WAKE_MS - 1)
    expect(FakeContext.all).toHaveLength(0)
    expect(FakeAudio.all).toHaveLength(0)

    await settle(1)
    expect(FakeContext.all).toHaveLength(1)
    expect(FakeAudio.all[0].play).toHaveBeenCalledTimes(1)
  })

  it('opens it at once when the tap is an answer waiting for its click', async () => {
    const sound = create()
    sound.start()
    touch()
    sound.tap()
    await settle(0)
    expect(FakeContext.all).toHaveLength(1)
    expect(FakeContext.all[0].sources).toHaveLength(1)
    expect(FakeContext.all[0].sources[0].start).toHaveBeenCalledWith(0, TAP_START_S)
  })

  it('does not open the audio for a click that no tap asked for', async () => {
    const sound = create()
    sound.start()
    sound.tap()
    await settle()
    expect(FakeContext.all).toHaveLength(0)
  })

  it('waits only once: later taps wake the sound straight away', async () => {
    const { music } = await awake()
    music.paused = true
    touch()
    await settle(0)
    expect(music.play).toHaveBeenCalledTimes(2)
  })

  it.each(['pointerup', 'click', 'keydown', 'touchend'])('starts with a %s', async (type) => {
    const sound = create()
    sound.start()
    touch(type)
    await settle()
    expect(FakeAudio.all[0].play).toHaveBeenCalledTimes(1)
  })

  it('does not start again what is already running', async () => {
    const { ctx, music } = await awake()
    touch('pointerup')
    touch('click')
    await settle()
    expect(FakeContext.all).toHaveLength(1)
    expect(music.play).toHaveBeenCalledTimes(1)
    expect(ctx.resume).toHaveBeenCalledTimes(1)
  })

  it('tries again with the next tap when the browser refused the music', async () => {
    refusePlay = true
    const sound = create()
    sound.start()
    touch()
    await settle()
    const [music] = FakeAudio.all
    expect(music.paused).toBe(true)

    refusePlay = false
    touch()
    await settle()
    expect(music.play).toHaveBeenCalledTimes(2)
    expect(music.paused).toBe(false)
  })

  it('opens a single context even if the click file will not decode', async () => {
    FakeContext.decode = async () => {
      throw new Error('bad data')
    }
    await awake()
    touch()
    await settle()
    expect(FakeContext.all).toHaveLength(1)
  })
})

describe('the click', () => {
  it('plays the decoded click through its own gain, from 25 ms in', async () => {
    const { sound, ctx } = await awake()
    sound.tap()
    expect(ctx.sources).toHaveLength(1)
    const [source] = ctx.sources
    expect(source.buffer).toEqual({ duration: 1.56 })
    expect(source.connect).toHaveBeenCalledWith(ctx.gains[1])
    expect(source.start).toHaveBeenCalledWith(0, TAP_START_S)
  })

  it('plays one click per tap and lets them overlap', async () => {
    const { sound, ctx } = await awake()
    sound.tap()
    sound.tap()
    expect(ctx.sources).toHaveLength(2)
  })

  it('plays a click asked for while the sound was still loading, as soon as it is ready', async () => {
    let finish!: (buffer: unknown) => void
    FakeContext.decode = () => new Promise((resolve) => (finish = resolve))
    const sound = create()
    sound.start()
    touch()
    await settle()
    const [ctx] = FakeContext.all
    sound.tap()
    expect(ctx.sources).toHaveLength(0)

    finish({ duration: 1.56 })
    await settle()
    expect(ctx.sources).toHaveLength(1)
    expect(ctx.sources[0].start).toHaveBeenCalledTimes(1)
  })

  it('drops a click that waited longer than it is worth', async () => {
    let finish!: (buffer: unknown) => void
    FakeContext.decode = () => new Promise((resolve) => (finish = resolve))
    const sound = create()
    sound.start()
    touch()
    await settle()
    const [ctx] = FakeContext.all
    sound.tap()
    await vi.advanceTimersByTimeAsync(TAP_GRACE_MS + 1)

    finish({ duration: 1.56 })
    await settle()
    expect(ctx.sources).toHaveLength(0)
  })

  it('gives up on a click file that will not download, after three tries', async () => {
    fetchMock.mockImplementation(async () => ({ ok: false }))
    const { sound } = await awake()
    for (let i = 0; i < 6; i++) {
      touch()
      sound.tap()
      await settle()
    }
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('is silent before the first tap and after the funnel stops it', async () => {
    const { sound, stop, ctx } = await awake()
    stop()
    sound.tap()
    expect(ctx.sources).toHaveLength(0)
  })
})

describe('muting', () => {
  it('fades the music out, pauses it once faded, remembers the choice and tells subscribers', async () => {
    const { sound, ctx, music } = await awake()
    const listener = vi.fn()
    sound.subscribe(listener)

    sound.setMuted(true)
    expect(sound.isMuted()).toBe(true)
    expect(ctx.gains[0].gain.setTargetAtTime).toHaveBeenCalledWith(
      0,
      ctx.currentTime,
      expect.any(Number),
    )
    expect(music.pause).not.toHaveBeenCalled()
    expect(localStorage.getItem(MUTED_KEY)).toBe('1')
    expect(listener).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(MUTE_FADE_S * 1000)
    expect(music.pause).toHaveBeenCalledTimes(1)
  })

  it('makes no click while muted', async () => {
    const { sound, ctx } = await awake()
    sound.setMuted(true)
    sound.tap()
    expect(ctx.sources).toHaveLength(0)
  })

  it('brings the music back when unmuted, and the click with it', async () => {
    const { sound, ctx, music } = await awake()
    sound.setMuted(true)
    await vi.advanceTimersByTimeAsync(MUTE_FADE_S * 1000)
    expect(music.paused).toBe(true)

    sound.setMuted(false)
    await settle()
    expect(localStorage.getItem(MUTED_KEY)).toBe('0')
    expect(music.paused).toBe(false)
    expect(ctx.gains[0].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      MUSIC_GAIN,
      ctx.currentTime + MUSIC_FADE_IN_S,
    )
    sound.tap()
    expect(ctx.sources).toHaveLength(1)
  })

  it('brings the music back even when unmuted in the middle of the fade', async () => {
    const { sound, ctx, music } = await awake()
    sound.setMuted(true)
    sound.setMuted(false)
    await vi.advanceTimersByTimeAsync(MUTE_FADE_S * 1000 * 2)
    expect(music.pause).not.toHaveBeenCalled()
    expect(ctx.gains[0].gain.linearRampToValueAtTime).toHaveBeenCalledTimes(2)
  })

  it('does not notify when the choice does not change', async () => {
    const { sound } = await awake()
    const listener = vi.fn()
    sound.subscribe(listener)
    sound.setMuted(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('stops notifying a subscriber that left', async () => {
    const { sound } = await awake()
    const listener = vi.fn()
    sound.subscribe(listener)()
    sound.setMuted(true)
    expect(listener).not.toHaveBeenCalled()
  })

  it('lets a visitor who muted it last time hear and download nothing', async () => {
    localStorage.setItem(MUTED_KEY, '1')
    const sound = create()
    expect(sound.isMuted()).toBe(true)
    sound.start()
    touch()
    sound.tap()
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(FakeContext.all).toHaveLength(0)
    expect(FakeAudio.all).toHaveLength(0)
  })

  it('starts the sound when a visitor who muted it last time turns it back on', async () => {
    localStorage.setItem(MUTED_KEY, '1')
    const sound = create()
    sound.start()
    sound.setMuted(false)
    await settle()
    expect(FakeAudio.all[0].play).toHaveBeenCalledTimes(1)
  })

  it('still mutes for the visit when the browser will not store the choice', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const sound = create()
    expect(sound.isMuted()).toBe(false)
    sound.setMuted(true)
    expect(sound.isMuted()).toBe(true)
  })
})

describe('a tab that is hidden', () => {
  const setHidden = (hidden: boolean) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
    document.dispatchEvent(new Event('visibilitychange'))
  }

  it('goes quiet, and comes back with the visitor', async () => {
    const { ctx, music } = await awake()
    setHidden(true)
    await settle()
    expect(music.pause).toHaveBeenCalledTimes(1)
    expect(ctx.suspend).toHaveBeenCalledTimes(1)

    setHidden(false)
    await settle()
    expect(ctx.state).toBe('running')
    expect(music.paused).toBe(false)
  })

  it('stays quiet for a visitor who muted it', async () => {
    const { sound, music } = await awake()
    sound.setMuted(true)
    setHidden(true)
    setHidden(false)
    await settle()
    expect(music.play).toHaveBeenCalledTimes(1)
  })

  it('makes no audio of its own before the first tap', async () => {
    const sound = create()
    sound.start()
    setHidden(true)
    setHidden(false)
    await settle()
    expect(FakeContext.all).toHaveLength(0)
  })
})

describe('starting and stopping', () => {
  it('counts the starts, so React running an effect twice does not stack listeners', async () => {
    const sound = create()
    const first = sound.start()
    const second = sound.start()
    first()
    first()
    touch()
    await settle()
    expect(FakeAudio.all).toHaveLength(1)

    second()
    expect(FakeAudio.all[0].pause).toHaveBeenCalledTimes(1)
    touch()
    await settle()
    expect(FakeAudio.all[0].play).toHaveBeenCalledTimes(1)
  })

  it('pauses the music and stops listening when the funnel goes', async () => {
    const { stop, music, ctx } = await awake()
    stop()
    expect(music.pause).toHaveBeenCalledTimes(1)
    expect(ctx.suspend).toHaveBeenCalledTimes(1)
    touch()
    await settle()
    expect(music.play).toHaveBeenCalledTimes(1)
  })

  it('gives up on a graph that cannot be built, without opening a context on every tap', async () => {
    class BrokenContext extends FakeContext {
      createMediaElementSource = vi.fn(() => {
        throw new Error('cannot')
      })
    }
    vi.stubGlobal('AudioContext', BrokenContext)
    const sound = create()
    sound.start()
    touch()
    touch('pointerup')
    sound.tap()
    await settle()
    expect(FakeContext.all).toHaveLength(1)
    expect(FakeContext.all[0].close).toHaveBeenCalledTimes(1)
  })
})

describe('without Web Audio', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
  })

  it('reports it, and everything else is a silent no-op', async () => {
    const sound = create()
    expect(sound.isSupported()).toBe(false)
    const stop = sound.start()
    touch()
    sound.tap()
    sound.setMuted(true)
    sound.setMuted(false)
    stop()
    await settle()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(FakeAudio.all).toHaveLength(0)
  })
})
