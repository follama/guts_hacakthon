// Tunable game constants, kept in one place.
export const SWIPES_BEFORE_DRAW = 3
export const DRAW_TIME_SECONDS = 60
export const RESULT_SECONDS = 4
export const SWIPE_THRESHOLD = 90

export const COLOURS = ['#1a1a1a', '#b71c1c', '#f48fb1', '#1e88e5', '#43a047', '#fdd835', '#8d6e63']

export function shuffle(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
