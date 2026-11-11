import { createBrowserSound } from './browser'

export { MUTED_KEY, createBrowserSound } from './browser'
export type { SoundService } from './types'

/**
 * The sound of the page. Creating it touches nothing (no window, no audio): it stays idle until
 * <SoundControl> starts it, so it is safe to import on the server and in tests.
 */
export const browserSound = createBrowserSound()
