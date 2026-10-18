// Tunable game constants, kept in one place.
export const SWIPES_BEFORE_DRAW = 3
export const DRAW_TIME_SECONDS = 60
export const RESULT_SECONDS = 4
export const SWIPE_THRESHOLD = 90

export const COLOURS = ['#1a1a1a', '#b71c1c', '#f48fb1', '#1e88e5', '#43a047', '#fdd835', '#8d6e63']

// Keep tagged items that match plus untagged ones, but only if at least one
// tagged item matches; otherwise the choice is ignored rather than leaving
// the deck empty or full of leftovers.
function narrow(list, isTagged, matches) {
  const hit = list.some((i) => isTagged(i) && matches(i))
  return hit ? list.filter((i) => !isTagged(i) || matches(i)) : list
}

export function pickItems(items, { gender, styles }) {
  const pool = narrow(items, (i) => !!i.gender, (i) => i.gender === gender || i.gender === 'unisex')
  if (!styles.length) return pool
  return narrow(pool, (i) => i.styles.length > 0, (i) => i.styles.some((s) => styles.includes(s)))
}

export function shuffle(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
