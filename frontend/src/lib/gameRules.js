// Tunable game constants, kept in one place.
export const SWIPES_BEFORE_DRAW = 3
export const DRAW_TIME_SECONDS = 60
export const RESULT_SECONDS = 4
export const SWIPE_THRESHOLD = 90

export const COLOURS = [
  '#1a1a1a', // black
  '#4a4a4a', // dark grey
  '#9e9e9e', // mid grey
  '#d4d4d4', // light grey
  '#ffffff', // white
  '#f3e7ba', // beige
  '#b71c1c', // deep red
  '#e53935', // red
  '#ff7043', // orange-red
  '#ff9800', // orange
  '#fdd835', // yellow
  '#c0ca33', // lime
  '#43a047', // green
  '#00897b', // teal
  '#1e88e5', // blue
  '#5e35b1', // purple
  '#d81b60', // magenta
  '#f48fb1', // pink
  '#8d6e63', // brown
  '#a1887f', // warm taupe
]

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
