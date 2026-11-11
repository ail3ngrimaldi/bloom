/**
 * The funnel's two sounds (files in public/audio) and how loud each one plays. A gain is a multiple
 * of the file as it is (1 = unchanged). They were set against the measured levels of the files:
 *
 * - background.mp3: 68.6 s, peak -13.5 dBFS, about -28 dBFS RMS, fading in and out at its ends. It
 *   is already a quiet bed, so it plays as it is.
 * - click.mp3: 1.56 s, peak -20 dBFS, a soft chime that rings out for about a second. It is quieter
 *   than the music, so it plays about 8 dB louder to be heard as the answer to a tap.
 */
export const MUSIC_URL = '/audio/background.mp3'
export const TAP_URL = '/audio/click.mp3'

export const MUSIC_GAIN = 1
export const TAP_GAIN = 2.5

/** click.mp3 opens with 30 ms of silence; starting 25 ms in makes the sound land on the tap. */
export const TAP_START_S = 0.025
/** The music rises from silence over this long when it starts or comes back from muted. */
export const MUSIC_FADE_IN_S = 1.5
/** And falls to silence over this long when it is muted. */
export const MUTE_FADE_S = 0.25
/**
 * How long after the visitor's first tap the audio is opened. Opening it takes 100 to 250 ms of the
 * main thread, and right after a tap that would hold back the step the tap leaves: its fade out
 * (400 ms) ends in a change of the frame, which the browser only forgives as a layout shift if it
 * comes within 500 ms of the tap. So it waits until the next step is in. It stays under a second
 * because WebKit only counts a timer as part of the tap for that long.
 */
export const FIRST_WAKE_MS = 800
/**
 * A click asked for while the sound is still warming up plays if it is ready within this. The very
 * first tap of a visit can be an answer (a reload, a link to a question), and then the audio is
 * opened at once instead: about 200 ms for the context, and the file has to decode.
 */
export const TAP_GRACE_MS = 800
