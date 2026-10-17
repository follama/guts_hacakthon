// Tunable game constants, kept in one place.
export const SWIPES_BEFORE_DRAW = { min: 2, max: 4 }
export const SECONDS_BEFORE_DRAW = { min: 20, max: 60 }
export const DRAW_TIME_SECONDS = 30
export const PASS_THRESHOLD = 45 // must match PASS_THRESHOLD in backend/app/main.py

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
