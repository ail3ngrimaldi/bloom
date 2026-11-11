/**
 * The funnel's sound: a quiet music loop that plays from the visitor's first tap until they leave,
 * and a click when they answer a question. Browsers only let sound begin inside a tap or a key
 * press, so nothing is heard before the first one; after that the music is always on unless the
 * visitor turns the sound off, a choice that is kept for their next visit.
 */
export interface SoundService {
  /** Whether this browser can play the funnel's sound at all (false on the server). */
  isSupported(): boolean
  /** Starts listening for the first tap, which is when the music begins. Returns the cleanup. */
  start(): () => void
  /**
   * The click of an answer: a single-select option, the Continue of a multi-select. Silent while
   * muted, before `start` and when the sound cannot load.
   */
  tap(): void
  /** Whether the visitor turned the sound off. */
  isMuted(): boolean
  setMuted(muted: boolean): void
  /** For useSyncExternalStore: `listener` runs when `isMuted()` changes. */
  subscribe(listener: () => void): () => void
}
