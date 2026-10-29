let locks = 0
let saved: { overflow: string; paddingRight: string } | null = null

/**
 * Stops the page behind a modal from scrolling. Calls nest: the page unlocks only when every lock
 * has been released. Returns the release function.
 */
export function lockScroll(): () => void {
  const body = document.body
  if (locks === 0) {
    saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    // Hiding the scrollbar would widen the page and make it jump; pad by the same amount.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) {
      body.style.paddingRight = `${(parseFloat(getComputedStyle(body).paddingRight) || 0) + scrollbar}px`
    }
    body.style.overflow = 'hidden'
  }
  locks += 1

  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0 && saved) {
      body.style.overflow = saved.overflow
      body.style.paddingRight = saved.paddingRight
      saved = null
    }
  }
}
