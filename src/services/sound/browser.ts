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
} from './files'
import type { SoundService } from './types'

/** localStorage key of the visitor's choice: '1' = sound off. */
export const MUTED_KEY = 'bloom.sound.muted'

/**
 * What lets a browser begin sound: a press or a key (Chrome), a click, a key or a touch that ends
 * (Safari, Firefox). Listening to all of them means the visitor's first real tap starts it,
 * whichever browser it is.
 */
const GESTURES = ['pointerup', 'click', 'keydown', 'touchend'] as const

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext }
type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }

const ignore = () => {}

/** Runs a call the browser may refuse (autoplay policy, a closed context) and ignores the refusal. */
function attempt(call: () => unknown) {
  try {
    void Promise.resolve(call()).catch(ignore)
  } catch {
    // Not an error: the next tap tries again.
  }
}

function contextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  const win = window as WebkitWindow
  return win.AudioContext ?? win.webkitAudioContext ?? null
}

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

function writeMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    // Storage blocked (private mode): the choice holds until the page closes.
  }
}

async function fetchBytes(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url)
    return response.ok ? await response.arrayBuffer() : null
  } catch {
    return null
  }
}

/** The audio graph: the music (a streamed element) and the click both go through one context. */
interface Graph {
  ctx: AudioContext
  music: HTMLAudioElement
  musicGain: GainNode
  tapGain: GainNode
}

/** Give up on the click file after this many failed downloads or decodes. */
const TAP_ATTEMPTS = 3

/**
 * The sound of the funnel in a browser. Everything goes through one Web Audio context so that the
 * music and the click share the volume controls and the phone's silent switch, and the click starts
 * with no delay (an element needs tens of milliseconds to start; a decoded buffer does not).
 *
 * Nothing is created before the visitor's first tap: browsers refuse sound without one, and a
 * context made earlier only logs a warning. A visitor who muted the sound downloads nothing.
 */
export function createBrowserSound(): SoundService {
  const listeners = new Set<() => void>()
  let muted: boolean | null = null
  let starts = 0
  let graph: Graph | null = null
  let unavailable = false
  let silenced = false
  let tapBuffer: AudioBuffer | null = null
  let tapBytes: Promise<ArrayBuffer | null> | null = null
  let tapLoading = false
  let tapFailures = 0
  let pendingTapAt: number | null = null
  let pauseTimer: ReturnType<typeof setTimeout> | undefined
  let firstWake: ReturnType<typeof setTimeout> | undefined

  const isMuted = () => {
    // The choice is stored in the browser, so it is read on first use and never on the server.
    if (muted === null) {
      if (typeof window === 'undefined') return false
      muted = readMuted()
    }
    return muted
  }

  function ensureGraph(): Graph | null {
    if (graph) return graph
    const Context = contextClass()
    if (!Context || unavailable) return null
    let ctx: AudioContext | undefined
    try {
      ctx = new Context()
      const music = new Audio(MUSIC_URL)
      music.loop = true
      music.preload = 'auto'
      const musicGain = ctx.createGain()
      musicGain.gain.value = 0
      const tapGain = ctx.createGain()
      tapGain.gain.value = TAP_GAIN
      ctx.createMediaElementSource(music).connect(musicGain)
      musicGain.connect(ctx.destination)
      tapGain.connect(ctx.destination)
      ctx.addEventListener('statechange', flushTap)
      graph = { ctx, music, musicGain, tapGain }
      ambientSession()
      return graph
    } catch {
      // Without a working graph there is no sound; do not keep opening contexts on every tap.
      unavailable = true
      attempt(() => ctx?.close())
      return null
    }
  }

  /**
   * On iOS (16.4 and later) the 'ambient' session mixes the music with what the visitor is already
   * playing instead of stopping it, and follows the silent switch.
   */
  function ambientSession() {
    try {
      const session = (navigator as AudioSessionNavigator).audioSession
      if (session) session.type = 'ambient'
    } catch {
      // Not supported: the browser keeps its default.
    }
  }

  /** Downloads the click as soon as the funnel is up, so it is ready by the first answer. */
  function prefetchTap() {
    if (contextClass() && !tapBuffer) tapBytes ??= fetchBytes(TAP_URL)
  }

  function loadTap(g: Graph) {
    if (tapBuffer || tapLoading || tapFailures >= TAP_ATTEMPTS) return
    tapLoading = true
    const bytes = (tapBytes ??= fetchBytes(TAP_URL))
    tapBytes = null
    bytes
      .then((data) => (data ? g.ctx.decodeAudioData(data) : null))
      .then((buffer) => {
        tapBuffer = buffer
        if (!buffer) tapFailures += 1
      })
      .catch(() => {
        tapFailures += 1
      })
      .finally(() => {
        tapLoading = false
        flushTap()
      })
  }

  function playTap(): boolean {
    const g = graph
    if (!g || !tapBuffer || g.ctx.state !== 'running') return false
    const source = g.ctx.createBufferSource()
    source.buffer = tapBuffer
    source.connect(g.tapGain)
    source.start(0, TAP_START_S)
    return true
  }

  /** Plays the click a tap asked for while the sound was still warming up, if it is not too late. */
  function flushTap() {
    if (pendingTapAt === null) return
    if (Date.now() - pendingTapAt > TAP_GRACE_MS) pendingTapAt = null
    else if (playTap()) pendingTapAt = null
  }

  /**
   * Brings the sound up. It runs right after the visitor's taps and key presses (see onGesture),
   * the only moments a browser lets sound begin, and again after every one of them: it is what
   * restarts the music after the browser stopped it (the phone rang, the tab was in the background).
   */
  function wake() {
    firstWake = undefined
    if (starts === 0 || isMuted()) return
    const g = ensureGraph()
    if (!g) return
    loadTap(g)
    if (g.ctx.state === 'running' && !g.music.paused && !silenced) return
    silenced = false
    clearTimeout(pauseTimer)
    attempt(() => g.ctx.resume())
    const now = g.ctx.currentTime
    g.musicGain.gain.cancelScheduledValues(now)
    g.musicGain.gain.setValueAtTime(g.musicGain.gain.value, now)
    g.musicGain.gain.linearRampToValueAtTime(MUSIC_GAIN, now + MUSIC_FADE_IN_S)
    attempt(() => g.music.play())
  }

  function fadeOut() {
    pendingTapAt = null
    const g = graph
    if (!g) return
    silenced = true
    const now = g.ctx.currentTime
    g.musicGain.gain.cancelScheduledValues(now)
    g.musicGain.gain.setTargetAtTime(0, now, MUTE_FADE_S / 3)
    clearTimeout(pauseTimer)
    pauseTimer = setTimeout(() => {
      if (isMuted()) g.music.pause()
    }, MUTE_FADE_S * 1000)
  }

  /** A hidden tab is quiet; it picks up again when the visitor comes back. */
  function onVisibility() {
    const g = graph
    if (!g) return
    if (document.hidden) {
      g.music.pause()
      attempt(() => g.ctx.suspend())
    } else {
      wake()
    }
  }

  /**
   * What a tap or a key press sets going. The first time, opening the audio takes 100 to 250 ms of
   * the main thread; right after the tap that would hold back the step it leaves, and the change of
   * the frame at the end of that step's fade out would stop counting as caused by the tap (it
   * would be a layout shift). So the first time it waits until the next step is in (FIRST_WAKE_MS)
   * and an answer that needs its click hurries it (tap). Browsers still count such a timer as part
   * of the tap: Chrome and Firefox remember the tap for seconds, WebKit hands it on to a timer set
   * from its handler for up to a second.
   */
  function onGesture() {
    if (graph) setTimeout(wake, 0)
    else firstWake ??= setTimeout(wake, FIRST_WAKE_MS)
  }

  /** An answer is waiting for its click: do not wait for the next step to come in. */
  function hurry() {
    if (firstWake === undefined) return
    clearTimeout(firstWake)
    firstWake = undefined
    setTimeout(wake, 0)
  }

  function attach() {
    for (const type of GESTURES)
      window.addEventListener(type, onGesture, { capture: true, passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    if (!isMuted()) prefetchTap()
  }

  function detach() {
    for (const type of GESTURES) window.removeEventListener(type, onGesture, { capture: true })
    document.removeEventListener('visibilitychange', onVisibility)
    clearTimeout(pauseTimer)
    clearTimeout(firstWake)
    firstWake = undefined
    pendingTapAt = null
    if (!graph) return
    graph.music.pause()
    attempt(() => graph?.ctx.suspend())
  }

  return {
    isSupported: () => contextClass() !== null,

    start() {
      starts += 1
      if (starts === 1) attach()
      let active = true
      return () => {
        if (!active) return
        active = false
        starts -= 1
        if (starts === 0) detach()
      }
    },

    tap() {
      // The tap that asks for this click is also what wakes the sound (see onGesture), so the click
      // may have to wait a moment for the context to run and the file to decode.
      if (starts === 0 || isMuted()) return
      if (playTap()) return
      pendingTapAt = Date.now()
      hurry()
    },

    isMuted,

    setMuted(next) {
      if (next === isMuted()) return
      muted = next
      writeMuted(next)
      if (next) fadeOut()
      else wake()
      for (const listener of listeners) listener()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}
