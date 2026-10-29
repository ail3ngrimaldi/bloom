/** Clamps a progress fraction to 0..1; non-finite input counts as 0. */
export function clampProgress(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}
